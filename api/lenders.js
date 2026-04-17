// HyCRE.ai — Lender Registry API
// Reads from cre_lenders Supabase table
// Falls back gracefully if table not yet migrated (returns empty, client uses its hardcoded constant)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// In-memory cache — 10 min TTL
let cache = { data: null, ts: 0 };
const CACHE_TTL_MS = 10 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Optional filters
  const { type, state, min_loan, prop_type } = req.query;

  // Cache hit (unfiltered only)
  const noFilters = !type && !state && !min_loan && !prop_type;
  if (noFilters && cache.data && (Date.now() - cache.ts) < CACHE_TTL_MS) {
    res.setHeader('x-cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  try {
    // Build query
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'id.asc');
    params.set('active', 'eq.true');
    if (type) params.set('type', `eq.${type}`);
    if (min_loan) params.set('min_loan', `lte.${min_loan}`);

    const r = await fetch(`${SUPABASE_URL}/rest/v1/cre_lenders?${params}`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });

    if (!r.ok) {
      // Table doesn't exist yet or other error — respond with empty + flag
      return res.status(200).json({
        lenders: [],
        source: 'fallback_required',
        error: `Supabase ${r.status}`,
      });
    }

    const rows = await r.json();

    // Map snake_case → camelCase to match App.jsx shape
    let lenders = rows.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      logo: r.logo,
      minLoan: r.min_loan,
      maxLoan: r.max_loan,
      maxLTV: r.max_ltv,
      minDSCR: r.min_dscr,
      propTypes: r.prop_types || [],
      markets: r.markets,
      rateRange: r.rate_range,
      term: r.term,
      amort: r.amort,
      contact: r.contact,
      phone: r.phone,
      website: r.website,
      specialty: r.specialty,
      notes: r.notes,
      lastVerified: r.last_verified,
    }));

    // Client-side filters that REST can't easily do
    if (prop_type) {
      lenders = lenders.filter(l => (l.propTypes || []).includes(prop_type));
    }
    if (state) {
      lenders = lenders.filter(l => {
        const m = (l.markets || '').toLowerCase();
        return m.includes('nationwide') || m.includes(state.toLowerCase());
      });
    }

    const payload = {
      lenders,
      count: lenders.length,
      source: 'supabase.cre_lenders',
      updated: new Date().toISOString(),
    };

    if (noFilters) {
      cache = { data: payload, ts: Date.now() };
    }
    res.setHeader('x-cache', 'MISS');
    res.setHeader('cache-control', 'public, max-age=60, s-maxage=600');
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(200).json({ lenders: [], source: 'error_fallback', error: err.message });
  }
}
