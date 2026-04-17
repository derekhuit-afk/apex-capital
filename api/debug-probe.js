const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.query.key !== 'audit_2026_04_17') return res.status(403).json({ error: 'nope' });

  // Get OpenAPI spec to list all tables
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Accept': 'application/openapi+json' },
    });
    if (!r.ok) return res.status(500).json({ error: `OpenAPI ${r.status}` });
    const spec = await r.json();
    const tables = Object.keys(spec.definitions || spec.components?.schemas || {}).sort();
    const hmda = tables.filter(t => t.includes('hmda'));
    const cre = tables.filter(t => t.includes('cre'));
    const lender = tables.filter(t => t.toLowerCase().includes('lend'));
    return res.status(200).json({
      totalTables: tables.length,
      hmda,
      cre,
      lender,
      allTables: tables,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
