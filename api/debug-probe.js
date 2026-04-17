const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.query.key !== 'audit_2026_04_17') return res.status(403).json({ error: 'nope' });

  const results = {};

  // Sample voc_hmda_aggregates
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/voc_hmda_aggregates?select=*&limit=3`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    });
    const rows = await r.json();
    results.voc_hmda_aggregates = {
      sampleRows: rows,
      columns: rows[0] ? Object.keys(rows[0]) : [],
    };
  } catch (e) { results.voc_hmda_aggregates = { error: e.message }; }

  // Count voc_hmda
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/voc_hmda_aggregates?select=*`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'count=exact', 'Range': '0-0' },
    });
    results.voc_hmda_aggregates_count = r.headers.get('content-range');
  } catch (e) {}

  // Test CFPB public HMDA API
  try {
    const url = 'https://ffiec.cfpb.gov/v2/data-browser-api/view/aggregations?years=2024&states=AK&loan_products=Conventional&loan_purposes=Refinancing';
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    results.cfpb_test = { status: r.status, ok: r.ok };
    if (r.ok) {
      const data = await r.json();
      results.cfpb_test.sample = JSON.stringify(data).slice(0, 500);
    }
  } catch (e) { results.cfpb_test = { error: e.message }; }

  // Test CFPB filters/records endpoint for actual records
  try {
    const url = 'https://ffiec.cfpb.gov/v2/data-browser-api/view/filters?years=2024&states=AK&loan_purposes=1&total_units=5-%3E149&loan_amount=1000000-999999999&page=1&per_page=5';
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    results.cfpb_records = { status: r.status, ok: r.ok };
    if (r.ok) {
      const data = await r.json();
      results.cfpb_records.sample = JSON.stringify(data).slice(0, 1500);
    }
  } catch (e) { results.cfpb_records = { error: e.message }; }

  return res.status(200).json(results);
}
