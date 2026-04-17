// HyCRE.ai — AI-Generated CRE Market Brief
// Uses Anthropic Claude to produce a fresh daily CRE capital markets headlines feed
// Cached 4 hours to control API costs

export const config = { runtime: 'nodejs' };

let cache = { data: null, ts: 0 };
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function todayStr() {
  return new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

async function generateBrief(marketContext) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const prompt = `You are a CRE capital markets analyst. Today is ${todayStr()}.

Generate a JSON array of exactly 7 headline objects representing what CRE capital finders need to know RIGHT NOW. Each must be plausible for today's date and reference current 2026 market conditions.

Current rate context:${marketContext || ' 10yr Treasury ~4.30%, SOFR ~4.35%, Prime ~7.50%, CRE perm rates 6.50-7.50%'}

Cover these beats: (1) Rates/Fed policy, (2) Multifamily cap rates, (3) Industrial or Office, (4) Bridge/CMBS lending volume, (5) Regional/Alaska CRE, (6) Life company or agency activity, (7) One market headwind or distress signal.

Each headline must be:
- Specific with numbers or named markets/lenders where possible
- Under 120 characters
- Plausible for an April 2026 news cycle (post-Iran tensions, sticky 3.3% CPI, Fed holding)
- Not referencing "H2 2025" or anything pre-2026

Return ONLY a valid JSON array, no prose. Schema:
[{"headline":"string","source":"plausible source","time":"Today/Yesterday/2d ago","tag":"RATES|MULTIFAMILY|OFFICE|INDUSTRIAL|LENDING|CMBS|ALASKA|CAPITAL|BRIDGE","positive":true|false}]`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You output only valid JSON arrays. No preamble, no markdown fences, no commentary.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const data = await r.json();
  let text = '';
  if (Array.isArray(data.content)) {
    text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
  }
  // Strip markdown fences if the model added them
  text = text.replace(/```json|```/g, '').trim();
  const headlines = JSON.parse(text);
  if (!Array.isArray(headlines)) throw new Error('Non-array response');
  return headlines.slice(0, 7);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cache
  if (cache.data && (Date.now() - cache.ts) < CACHE_TTL_MS) {
    res.setHeader('x-cache', 'HIT');
    res.setHeader('cache-control', 'public, max-age=600, s-maxage=14400');
    return res.status(200).json(cache.data);
  }

  try {
    // Fetch live rates to pass as context
    let marketContext = '';
    try {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host;
      const marketRes = await fetch(`${proto}://${host}/api/market`, {
        signal: AbortSignal.timeout(8000),
      });
      if (marketRes.ok) {
        const m = await marketRes.json();
        if (m.rates?.length) {
          marketContext = ' ' + m.rates.map(r => `${r.label}: ${r.value}`).join(', ');
        }
      }
    } catch {}

    const headlines = await generateBrief(marketContext);
    const payload = {
      updated: new Date().toISOString(),
      headlines,
      generated_by: 'Claude Sonnet 4',
    };
    cache = { data: payload, ts: Date.now() };
    res.setHeader('x-cache', 'MISS');
    res.setHeader('cache-control', 'public, max-age=600, s-maxage=14400');
    return res.status(200).json(payload);
  } catch (err) {
    if (cache.data) {
      res.setHeader('x-cache', 'STALE');
      return res.status(200).json({ ...cache.data, degraded: true, error: err.message });
    }
    // Final fallback — minimal static headlines marked as such
    return res.status(200).json({
      updated: new Date().toISOString(),
      headlines: [
        { headline: 'Live market brief temporarily unavailable — refresh to retry', source: 'HyCRE.ai', time: 'Just now', tag: 'SYSTEM', positive: true },
      ],
      degraded: true,
      error: err.message,
    });
  }
}
