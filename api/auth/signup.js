const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, password, tier, tosAccepted } = req.body;

  if (!email || !name || !password) return res.status(400).json({ error: 'Missing required fields' });
  if (!tosAccepted) return res.status(400).json({ error: 'Terms of Service must be accepted' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    // Create user in Supabase Auth
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          tier: tier || 'foundation',
          plan_status: 'pending_payment',
          payment_verified: false,
          tos_accepted_at: new Date().toISOString(),
        },
      }),
    });

    const user = await createRes.json();

    if (!createRes.ok) {
      const msg = user.msg || user.message || 'Signup failed';
      if (msg.toLowerCase().includes('already')) return res.status(409).json({ error: 'An account with this email already exists.' });
      return res.status(400).json({ error: msg });
    }

    // Sign in immediately to get session token
    const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const session = await signInRes.json();

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name,
        tier: tier || 'foundation',
        plan_status: 'pending_payment',
        payment_verified: false,
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
}
