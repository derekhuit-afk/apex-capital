// HyCRE.ai — Prospect Engine
// MULTIFAMILY: Real HMDA data via CFPB Public API (ffiec.cfpb.gov) — no API key required
// OTHER CRE TYPES: Synthetic simulator (HMDA doesn't cover Office/Retail/Industrial/Hotel/Storage)
// Saved prospects persist to cre_prospects (per-user pipeline)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const sb = async (path, opts = {}) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...(opts.headers || {}),
    },
  });
  return r.json();
};

// ─── CFPB HMDA Live ────────────────────────────────────────────
async function fetchCFPB({ state, year, loanPurposes, minLoan, maxLoan, perPage = 50 }) {
  const params = new URLSearchParams();
  params.set('years', year);
  params.set('states', state);
  params.set('total_units', '5-24,25-49,50-99,100-149,>149');
  if (loanPurposes) params.set('loan_purposes', loanPurposes);
  params.set('actions_taken', '1');
  const url = `https://ffiec.cfpb.gov/v2/data-browser-api/view/csv?${params}`;

  try {
    const r = await fetch(url, {
      headers: { 'Accept': 'text/csv' },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return { rows: [], error: `CFPB ${r.status}` };

    const csv = await r.text();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return { rows: [], error: 'empty' };

    const header = parseCsvLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length && rows.length < perPage * 3; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length !== header.length) continue;
      const rec = {};
      header.forEach((h, j) => { rec[h] = cols[j]; });
      const loanAmt = parseFloat(rec.loan_amount) || 0;
      if (minLoan && loanAmt < minLoan) continue;
      if (maxLoan && loanAmt > maxLoan) continue;
      rows.push(rec);
      if (rows.length >= perPage) break;
    }
    return { rows, total: lines.length - 1 };
  } catch (e) {
    return { rows: [], error: e.message };
  }
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && line[i+1] === '"') { cur += '"'; i++; continue; }
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === ',' && !inQuotes) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

const leiCache = {};
async function resolveLei(lei, year) {
  if (!lei) return null;
  if (leiCache[lei]) return leiCache[lei];
  try {
    const r = await fetch(`https://ffiec.cfpb.gov/v2/reporting/filers/${year}/${lei}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const name = data?.institution?.name || data?.respondent?.name || null;
    leiCache[lei] = name;
    return name;
  } catch { return null; }
}

async function larToProspect(rec, idx, year) {
  const loanAmt = parseFloat(rec.loan_amount) || 0;
  const lender = await resolveLei(rec.lei, year) || rec.lei || 'Unknown Lender';
  const origRate = parseFloat(rec.interest_rate) || estimateYearRate(year);
  const marketRate = 6.85;
  const rateGap = +(marketRate - origRate).toFixed(2);

  const age = new Date().getFullYear() - parseInt(year);
  const loanAgeFactor = age >= 3 ? 30 : age >= 1 ? 20 : 10;
  const rateFactor = rateGap > 0 ? Math.min(rateGap * 8, 25) : 0;
  const sizeFactor = loanAmt >= 5000000 ? 25 : loanAmt >= 2000000 ? 20 : loanAmt >= 1000000 ? 15 : 10;
  const typeBonus = 10;
  const refiScore = Math.min(Math.round(loanAgeFactor + Math.abs(rateFactor) + sizeFactor + typeBonus), 100);
  const priority = refiScore >= 70 ? 'Hot' : refiScore >= 50 ? 'Warm' : 'Cold';

  const purpose = String(rec.loan_purpose || '');
  const oppType = purpose.includes('Refin') || purpose.includes('31') || purpose.includes('32')
    ? 'Refi at Maturity'
    : age >= 3 ? 'Rate & Term Refi' : 'Bridge / Refinance';

  const city = rec.county_name || rec.county_code || rec.derived_msa_md || '—';
  const totalUnits = rec.total_units || '5-24';
  const company = `MF Sponsor · ${city} · ${totalUnits} units`;

  return {
    id: idx + 1,
    company,
    propType: 'Multifamily',
    state: rec.state_code || rec.state,
    city,
    loanAmt: Math.round(loanAmt),
    lender,
    year,
    origRate,
    rateGap,
    oppType,
    refiScore,
    priority,
    stage: 'new',
    notes: '',
    lastContacted: null,
    hmdaLei: rec.lei,
    source: 'cfpb_hmda_live',
    totalUnits,
    loanPurposeCode: purpose,
  };
}

function estimateYearRate(year) {
  const y = parseInt(year);
  const table = { 2017: 4.2, 2018: 4.8, 2019: 4.1, 2020: 3.5, 2021: 3.2, 2022: 5.8, 2023: 7.1, 2024: 6.9 };
  return table[y] || 6.5;
}

// ─── Synthetic for non-multifamily CRE ─────────────────────────
function generateSyntheticProspects({ propType, state, minLoan, maxLoan, year, count = 20 }) {
  const stateCities = {
    AK: ['Anchorage','Fairbanks','Juneau','Wasilla','Palmer','Kenai','Kodiak','Bethel','Soldotna'],
    WA: ['Seattle','Tacoma','Spokane','Bellevue','Kirkland','Redmond','Olympia','Vancouver','Bellingham'],
    OR: ['Portland','Eugene','Salem','Bend','Hillsboro','Beaverton','Medford','Corvallis'],
    CA: ['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland'],
    TX: ['Dallas','Houston','Austin','San Antonio','Fort Worth','El Paso','Arlington','Plano'],
    FL: ['Miami','Tampa','Orlando','Jacksonville','Fort Lauderdale','Tallahassee','St. Petersburg'],
    CO: ['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Boulder','Westminster'],
    AZ: ['Phoenix','Tucson','Mesa','Chandler','Scottsdale','Gilbert','Tempe','Surprise'],
    NY: ['New York City','Buffalo','Rochester','Albany','Yonkers','Syracuse','New Rochelle'],
    GA: ['Atlanta','Augusta','Columbus','Macon','Savannah','Athens','Sandy Springs'],
    NC: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville'],
    MT: ['Billings','Missoula','Great Falls','Bozeman','Butte','Helena','Kalispell'],
    ID: ['Boise','Nampa','Meridian','Idaho Falls','Pocatello','Twin Falls','Coeur d\'Alene'],
  };

  const lendersByType = {
    Agency: ['Fannie Mae (DUS)','Freddie Mac','Berkadia','Walker & Dunlop','Greystone'],
    National: ['Wells Fargo','JPMorgan Chase','Bank of America','U.S. Bank','PNC Bank','KeyBank'],
    Regional: ['Pacific Premier Bank','Western Alliance','HomeStreet Bank','Columbia Bank','Northrim Bank'],
    CMBS: ['DBRS Conduit','Citigroup CMBS','Goldman Sachs','Morgan Stanley CMBS','Rialto'],
    Bridge: ['Mesa West','ACORE Capital','Arbor Realty','Ready Capital','CoreVest Finance'],
    SBA: ['Live Oak Bank','Celtic Bank','U.S. Small Business Administration'],
    Local: ['First National Bank Alaska','Alaska USA FCU','Credit Union 1','Matanuska Valley FCU'],
  };

  const allLenders = Object.values(lendersByType).flat();
  const bizTypes = ['LLC','LP','Partners','Holdings','Capital','Properties','Group','Investments','Ventures','Fund'];
  const bizPrefixes = ['Summit','Pacific','Northern','Alpine','Denali','Cascade','Pioneer','Heritage','Frontier',
    'Landmark','Premier','Horizon','Gateway','Mesa','Ridge','Valley','Harbor','Anchor','Eagle','Arctic',
    'Midnight Sun','Peak','Meridian','Keystone','Clearwater','BlueSky','Coastal','Metro','Prime'];

  const propTypes = propType === 'All' ? ['Office','Retail','Industrial','Hotel','Self-Storage','Mixed-Use'] : [propType];
  const min = parseFloat(minLoan) || 500000;
  const max = parseFloat(maxLoan) || 5000000;
  const cities = stateCities[state] || stateCities['AK'];

  const rateByYear = { '2017':4.2,'2018':4.8,'2019':4.1,'2020':3.5,'2021':3.2,'2022':5.8,'2023':7.1,'2024':6.9,'2025':6.7,'2026':6.8 };
  const origRate = rateByYear[year] || 6.5;
  const marketRate = 6.85;
  const rateGap = parseFloat((marketRate - origRate).toFixed(2));

  return Array.from({ length: count }, (_, i) => {
    const prefix = bizPrefixes[Math.floor(Math.random() * bizPrefixes.length)];
    const prefix2 = bizPrefixes[Math.floor(Math.random() * bizPrefixes.length)];
    const bizType = bizTypes[Math.floor(Math.random() * bizTypes.length)];
    const companyName = `${prefix} ${prefix2} ${bizType}`;
    const pType = propTypes[i % propTypes.length];
    const city = cities[i % cities.length];
    const loanAmt = Math.round((min + Math.random() * (max - min)) / 50000) * 50000;
    const lender = allLenders[Math.floor(Math.random() * allLenders.length)];

    const loanAgeFactor = parseInt(year) <= 2022 ? 30 : 10;
    const rateFactor = rateGap > 0 ? Math.min(rateGap * 8, 25) : 0;
    const sizeFactor = loanAmt >= 2000000 ? 20 : loanAmt >= 1000000 ? 15 : 10;
    const typeBonus = ['Industrial'].includes(pType) ? 10 : 5;
    const refiScore = Math.min(Math.round(loanAgeFactor + Math.abs(rateFactor) + sizeFactor + typeBonus + Math.random() * 10), 100);
    const priority = refiScore >= 70 ? 'Hot' : refiScore >= 50 ? 'Warm' : 'Cold';
    const oppType = rateGap < 0 ? 'Rate Reduction' : parseInt(year) <= 2021 ? 'Maturity Risk / Refi' : parseInt(year) <= 2022 ? 'Rate & Term Refi' : 'Bridge / Refinance';

    return {
      id: i + 1,
      company: companyName,
      propType: pType,
      state,
      city,
      loanAmt,
      lender,
      year,
      origRate,
      rateGap: parseFloat(rateGap.toFixed(2)),
      oppType,
      refiScore,
      priority,
      stage: 'new',
      notes: '',
      lastContacted: null,
      source: 'simulator',
    };
  }).sort((a, b) => b.refiScore - a.refiScore);
}

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET' && query.action === 'search') {
    const { propType = 'Multifamily', state = 'AK', minLoan, maxLoan, year = '2024', count = '20' } = query;
    const n = Math.min(parseInt(count) || 20, 50);

    if (propType === 'Multifamily') {
      const safeYear = parseInt(year) > 2024 ? '2024' : year;
      const { rows, error, total } = await fetchCFPB({
        state, year: safeYear,
        loanPurposes: '1,31,32',
        minLoan: minLoan ? parseFloat(minLoan) : null,
        maxLoan: maxLoan ? parseFloat(maxLoan) : null,
        perPage: n,
      });

      if (error || rows.length === 0) {
        const synthetic = generateSyntheticProspects({ propType, state, minLoan, maxLoan, year, count: n });
        return res.status(200).json({
          prospects: synthetic,
          source: 'simulator_fallback',
          note: error ? `HMDA API unavailable: ${error}` : 'No multifamily HMDA records match — showing simulated prospects',
          queriedYear: safeYear,
        });
      }

      const prospects = await Promise.all(rows.map((r, i) => larToProspect(r, i, safeYear)));
      return res.status(200).json({
        prospects: prospects.sort((a, b) => b.refiScore - a.refiScore),
        source: 'cfpb_hmda_live',
        queriedYear: safeYear,
        total,
        note: safeYear !== year ? `Requested ${year} — CFPB HMDA published through 2024 only (2025 releases Sept 2026)` : null,
      });
    }

    const prospects = generateSyntheticProspects({ propType, state, minLoan, maxLoan, year, count: n });
    return res.status(200).json({
      prospects,
      source: 'simulator',
      note: `${propType} is not in HMDA — modeled from typical CRE parameters for refi scoring`,
    });
  }

  if (method === 'POST' && body?.action === 'save') {
    const { userId, prospects } = body;
    if (!userId || !Array.isArray(prospects)) {
      return res.status(400).json({ error: 'userId and prospects array required' });
    }
    const rows = prospects.map(p => ({
      user_id: userId,
      company: p.company, prop_type: p.propType, state: p.state, city: p.city,
      loan_amount: p.loanAmt, orig_lender: p.lender, orig_year: parseInt(p.year),
      orig_rate: p.origRate, rate_gap: p.rateGap,
      opp_type: p.oppType, refi_score: p.refiScore, priority: p.priority,
      source: p.source || 'unknown', hmda_lei: p.hmdaLei || null,
      stage: p.stage || 'new', notes: p.notes || '',
    }));
    const result = await sb('/cre_prospects', { method: 'POST', body: JSON.stringify(rows) });
    return res.status(200).json({ saved: Array.isArray(result) ? result.length : 0, result });
  }

  if (method === 'GET' && query.action === 'pipeline' && query.userId) {
    const rows = await sb(`/cre_prospects?user_id=eq.${query.userId}&order=refi_score.desc`, { method: 'GET' });
    return res.status(200).json({ prospects: rows });
  }

  return res.status(400).json({ error: 'Unknown action. Supported: search, save, pipeline' });
}
