// Temporary debug endpoint - deletes after audit
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  // Simple auth - require a secret
  if (req.query.key !== 'audit_2026_04_17') return res.status(403).json({ error: 'nope' });

  const tables = [
    'hmda_2024','hmda_2023','hmda_2022','hmda_2021','hmda_2020','hmda_2019','hmda_2018','hmda_2017',
    'hmda_lar_2024','hmda_all','hmda_national','hmda_records',
    'cre_lenders','cre_deals','cre_quotes','cre_deal_submissions','cre_market_snapshots','cre_subscriptions',
    'leads','agent_states','contacts'
  ];
  const results = {};
  for (const t of tables) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=*&limit=1`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'count=exact', 'Range': '0-0' },
      });
      const range = r.headers.get('content-range') || '';
      const total = range.split('/')[1] || '?';
      let sampleKeys = [];
      if (r.ok) {
        const full = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=*&limit=1`, {
          headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
        });
        if (full.ok) {
          const rows = await full.json();
          if (rows[0]) sampleKeys = Object.keys(rows[0]);
        }
      }
      results[t] = { status: r.status, rows: total, sampleKeys };
    } catch (e) {
      results[t] = { error: e.message };
    }
  }
  return res.status(200).json(results);
}
