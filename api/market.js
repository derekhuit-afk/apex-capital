// HyCRE.ai — Live Market Data Endpoint
// Pulls 10yr/2yr/5yr Treasury from US Treasury Direct (no API key)
// Pulls SOFR from NY Fed (no API key)
// Cached 15 minutes on Vercel Edge

export const config = { runtime: 'nodejs' };

// In-memory cache (persists within warm lambda)
let cache = { data: null, ts: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min

async function fetchTreasuryYields() {
  // US Treasury Direct daily yield curve XML feed
  // https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml
  const now = new Date();
  const year = now.getFullYear();
  const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'HyCRE.ai/1.0 Market Data' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Treasury ${r.status}`);
    const csv = await r.text();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('empty CSV');
    const header = lines[0].split(',').map(s => s.replace(/"/g, '').trim());
    // Most recent row = lines[1] (Treasury CSV sorts desc)
    const cols = lines[1].split(',').map(s => s.replace(/"/g, '').trim());
    const row = {};
    header.forEach((h, i) => { row[h] = cols[i]; });
    return {
      date: row['Date'],
      t2y: parseFloat(row['2 Yr']),
      t5y: parseFloat(row['5 Yr']),
      t10y: parseFloat(row['10 Yr']),
      t30y: parseFloat(row['30 Yr']),
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function fetchSOFR() {
  // NY Fed SOFR API — no key required
  try {
    const r = await fetch('https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) throw new Error(`NY Fed ${r.status}`);
    const data = await r.json();
    const rate = data?.refRates?.[0];
    return {
      date: rate?.effectiveDate,
      sofr: rate?.percentRate,
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function fetchFedFunds() {
  // NY Fed EFFR API
  try {
    const r = await fetch('https://markets.newyorkfed.org/api/rates/unsecured/effr/last/1.json', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) throw new Error(`NY Fed EFFR ${r.status}`);
    const data = await r.json();
    const rate = data?.refRates?.[0];
    return {
      date: rate?.effectiveDate,
      effr: rate?.percentRate,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// Build the RATE_ENV array HyCRE expects
function buildRateEnv(treasuries, sofr, effr, prev) {
  const out = [];
  const t10y = treasuries.t10y;
  const prevT10y = prev?.t10y;
  const dt10 = (t10y && prevT10y) ? +(t10y - prevT10y).toFixed(2) : 0;

  if (t10y) {
    out.push({
      label: '10-Year Treasury',
      value: `${t10y.toFixed(2)}%`,
      change: dt10 === 0 ? '0.00%' : `${dt10 > 0 ? '+' : ''}${dt10.toFixed(2)}%`,
      up: dt10 > 0 ? true : dt10 < 0 ? false : null,
    });
  }
  if (sofr.sofr) {
    out.push({
      label: 'SOFR 30-Day',
      value: `${parseFloat(sofr.sofr).toFixed(2)}%`,
      change: '—',
      up: null,
    });
  }
  if (effr.effr) {
    const effrVal = parseFloat(effr.effr);
    out.push({
      label: 'Fed Funds (EFFR)',
      value: `${effrVal.toFixed(2)}%`,
      change: '—',
      up: null,
    });
    // Derive Prime Rate = EFFR + 3.00 (standard US banking convention)
    out.push({
      label: 'Prime Rate',
      value: `${(effrVal + 3.00).toFixed(2)}%`,
      change: '—',
      up: null,
    });
  }
  // CMBS 10yr spread approximation (static industry midpoint until we wire a real source)
  if (t10y) {
    const creAllIn = t10y + 2.55;
    out.push({
      label: 'CRE Avg All-In',
      value: `${creAllIn.toFixed(2)}%`,
      change: '—',
      up: null,
      note: `10yr + 255bps typical`,
    });
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cache hit
  if (cache.data && (Date.now() - cache.ts) < CACHE_TTL_MS) {
    res.setHeader('x-cache', 'HIT');
    res.setHeader('cache-control', 'public, max-age=60, s-maxage=900');
    return res.status(200).json(cache.data);
  }

  try {
    const [treasuries, sofr, effr] = await Promise.all([
      fetchTreasuryYields(),
      fetchSOFR(),
      fetchFedFunds(),
    ]);

    const rateEnv = buildRateEnv(treasuries, sofr, effr);

    const payload = {
      updated: new Date().toISOString(),
      rates: rateEnv,
      raw: { treasuries, sofr, effr },
      source: 'US Treasury Direct + NY Fed (keyless public APIs)',
    };

    cache = { data: payload, ts: Date.now() };
    res.setHeader('x-cache', 'MISS');
    res.setHeader('cache-control', 'public, max-age=60, s-maxage=900');
    return res.status(200).json(payload);
  } catch (err) {
    // Fallback to stale cache if available
    if (cache.data) {
      res.setHeader('x-cache', 'STALE');
      return res.status(200).json({ ...cache.data, degraded: true, error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
}
