const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await userRes.json();
    if (!userRes.ok || !data.id) return res.status(401).json({ error: 'Invalid or expired session' });

    const meta = data.user_metadata || {};

    return res.status(200).json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: meta.name || 'User',
        tier: meta.tier || 'foundation',
        plan_status: meta.plan_status || 'active',
        payment_verified: meta.payment_verified || false,
      },
    });

  } catch (err) {
    return res.status(500).json({ error: 'Session validation failed' });
  }
}
