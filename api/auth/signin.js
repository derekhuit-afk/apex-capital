const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await signInRes.json();

    if (!signInRes.ok || !data.access_token) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const meta = data.user?.user_metadata || {};

    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: meta.name || 'User',
        tier: meta.tier || 'foundation',
        plan_status: meta.plan_status || 'active',
        payment_verified: meta.payment_verified || false,
      },
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Sign in failed. Please try again.' });
  }
}
