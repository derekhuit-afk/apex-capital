const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

async function getSupabaseUser(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${token}` },
  });
  if (!r.ok) return null;
  return r.json();
}

async function updateUserMeta(userId, meta) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_metadata: meta }),
  });
  return r.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const user = await getSupabaseUser(token);
  if (!user) return res.status(401).json({ error: 'Invalid session' });

  const meta = user.user_metadata || {};
  const { action } = req.method === 'GET' ? req.query : req.body;

  // ─── GET STATUS ───
  if (req.method === 'GET' || action === 'status') {
    const subscriptionId = meta.stripe_subscription_id;
    let subscriptionData = null;

    if (subscriptionId && STRIPE_KEY) {
      try {
        const r = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
          headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
        });
        subscriptionData = await r.json();
      } catch {}
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: meta.name,
        tier: meta.tier || 'foundation',
        plan_status: meta.plan_status || 'active',
        payment_verified: meta.payment_verified || false,
        stripe_customer_id: meta.stripe_customer_id,
        stripe_subscription_id: meta.stripe_subscription_id,
        created_at: user.created_at,
        payment_verified_at: meta.payment_verified_at,
      },
      subscription: subscriptionData ? {
        status: subscriptionData.status,
        current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        plan: subscriptionData.items?.data?.[0]?.price?.nickname,
      } : null,
    });
  }

  // ─── CANCEL SUBSCRIPTION ───
  if (action === 'cancel') {
    const subscriptionId = meta.stripe_subscription_id;

    if (!subscriptionId) {
      // Lifetime plan - can't cancel, just flag
      return res.status(200).json({ success: true, message: 'Lifetime access — no subscription to cancel.' });
    }

    if (!STRIPE_KEY) return res.status(500).json({ error: 'Payment system not configured' });

    try {
      // Cancel at period end (not immediately)
      const r = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'cancel_at_period_end=true',
      });
      const sub = await r.json();
      if (!r.ok) return res.status(400).json({ error: sub.error?.message || 'Cancellation failed' });

      // Update user metadata
      await updateUserMeta(user.id, {
        ...meta,
        plan_status: 'cancelling',
        cancel_at: sub.cancel_at,
      });

      // Send cancellation confirmation email
      if (RESEND_KEY) {
        const endDate = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'end of billing period';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: 'HyCRE.ai <billing@hycre.ai>',
            to: [user.email],
            subject: 'Your HyCRE.ai subscription has been cancelled',
            html: `
              <div style="font-family:sans-serif;max-width:520px;background:#07090F;color:#DDE2EE;padding:36px;border-radius:12px;">
                <span style="font-family:Georgia,serif;font-size:22px;color:#fff;">Hy<span style="color:#C49A28">CRE</span>.ai</span>
                <h2 style="font-family:Georgia,serif;color:#fff;margin:20px 0 12px;">Subscription Cancelled</h2>
                <p style="color:#58688A;line-height:1.6;">Your HyCRE.ai subscription has been cancelled. You'll continue to have full access until <strong style="color:#DDE2EE;">${endDate}</strong>.</p>
                <p style="color:#58688A;line-height:1.6;margin-top:12px;">Changed your mind? You can reactivate anytime from your dashboard.</p>
                <a href="https://hycre.ai" style="display:inline-block;background:linear-gradient(90deg,#C49A28,#E8BB44);color:#07090F;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:8px;margin-top:20px;">Reactivate →</a>
                <p style="color:#252F42;font-size:11px;margin-top:24px;">HyCRE.ai · A Huit.AI Product · Built From Alaska.</p>
              </div>
            `,
          }),
        });

        // Admin notification
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: 'HyCRE.ai <notifications@hycre.ai>',
            to: ['derekhuit@gmail.com'],
            subject: `⚠️ Subscription Cancelled — ${user.email}`,
            html: `<p style="font-family:sans-serif;">Subscription cancelled for ${user.email} (${meta.tier?.toUpperCase()}). Access until ${endDate}.</p>`,
          }),
        });
      }

      return res.status(200).json({
        success: true,
        cancel_at_period_end: true,
        access_until: sub.current_period_end,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Cancellation failed. Please try again.' });
    }
  }

  // ─── REACTIVATE ───
  if (action === 'reactivate') {
    const subscriptionId = meta.stripe_subscription_id;
    if (!subscriptionId || !STRIPE_KEY) return res.status(400).json({ error: 'No subscription found' });

    try {
      const r = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'cancel_at_period_end=false',
      });
      const sub = await r.json();
      if (!r.ok) return res.status(400).json({ error: sub.error?.message });

      await updateUserMeta(user.id, { ...meta, plan_status: 'active' });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Reactivation failed' });
    }
  }

  // ─── BILLING PORTAL ───
  if (action === 'portal') {
    const customerId = meta.stripe_customer_id;
    if (!customerId || !STRIPE_KEY) return res.status(400).json({ error: 'No billing account found' });

    try {
      const r = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
          return_url: 'https://hycre.ai',
        }),
      });
      const session = await r.json();
      if (!r.ok) return res.status(400).json({ error: session.error?.message });
      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res.status(500).json({ error: 'Could not open billing portal' });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
