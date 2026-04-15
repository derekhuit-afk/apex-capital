const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function verifyStripeSignature(payload, signature, secret) {
  if (!secret || !signature) return true; // dev mode

  const crypto = await import('crypto');
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const sigHash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !sigHash) return false;

  const signedPayload = `${timestamp}.${payload.toString()}`;
  const expected = crypto.default.createHmac('sha256', secret).update(signedPayload).digest('hex');

  return crypto.default.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sigHash, 'hex'));
}

async function updateUserPaymentStatus(email, tier, stripeCustomerId, stripeSubId, planStatus) {
  // Find user by email in Supabase Auth
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
  });
  const { users } = await listRes.json();
  const user = users?.find(u => u.email === email);
  if (!user) { console.log('No user found for email:', email); return false; }

  // Update user metadata
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_metadata: {
        ...user.user_metadata,
        tier: tier || user.user_metadata?.tier,
        plan_status: planStatus || 'active',
        payment_verified: true,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubId,
        payment_verified_at: new Date().toISOString(),
      },
    }),
  });

  return updateRes.ok;
}

async function sendWelcomeEmail(email, name, tier) {
  if (!RESEND_KEY) return;

  const tierName = tier?.toUpperCase() || 'FOUNDATION';
  const isMonthly = tier === 'active' || tier === 'agency';

  const html = `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;background:#07090F;color:#DDE2EE;padding:0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0D1019,#131825);padding:32px 36px;border-bottom:1px solid #192030;">
        <span style="font-family:Georgia,serif;font-size:24px;color:#fff;font-weight:600;">Hy<span style="color:#C49A28">CRE</span>.ai</span>
      </div>
      <div style="padding:36px;">
        <h1 style="font-family:Georgia,serif;font-size:30px;color:#fff;margin:0 0 8px;">Welcome to HyCRE, ${name || 'there'}.</h1>
        <p style="color:#58688A;font-size:14px;margin:0 0 28px;">Your <strong style="color:#E8BB44;">${tierName}</strong> plan is active. The intelligence layer for CRE capital is now in your hands.</p>

        <div style="background:#131825;border:1px solid #192030;border-radius:10px;padding:20px;margin-bottom:28px;">
          <p style="font-size:12px;color:#58688A;margin:0 0 14px;font-family:monospace;letter-spacing:.1em;text-transform:uppercase;">What you have access to</p>
          <div style="display:grid;gap:8px;">
            ${['🏛 CRE AI MasterClass — 5 live AI-generated modules','📄 Deal Packager AI — lender-ready memos in seconds','📊 Underwriting Suite — 6 live calculators','🏦 Lender Intelligence Engine — match 500+ lenders','🎯 HMDA Prospecting Engine — AI outreach sequences','🧠 Huit Brain AI Advisor — 24/7 CRE expert','📈 Market Intelligence Feed — live cap rates & news'].map(f => `<div style="font-size:13px;color:#DDE2EE;">${f}</div>`).join('')}
          </div>
        </div>

        <a href="https://hycre.ai" style="display:inline-block;background:linear-gradient(90deg,#C49A28,#E8BB44);color:#07090F;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;margin-bottom:28px;">Open Your Dashboard →</a>

        ${isMonthly ? `<p style="color:#58688A;font-size:12px;margin:0 0 8px;">Your plan renews monthly. Manage your subscription anytime from your dashboard.</p>` : `<p style="color:#58688A;font-size:12px;margin:0 0 8px;">You have lifetime access. No renewals, no surprises.</p>`}

        <div style="border-top:1px solid #192030;margin-top:28px;padding-top:20px;">
          <p style="color:#252F42;font-size:11px;margin:0;">Questions? Reply to this email or reach us at support@hycre.ai</p>
          <p style="color:#252F42;font-size:11px;margin:6px 0 0;">HyCRE.ai · A Huit.AI Product · Built From Alaska.</p>
        </div>
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({
      from: 'Derek at HyCRE.ai <derek@hycre.ai>',
      to: [email],
      subject: `You're in. Welcome to HyCRE.ai — ${tierName} Plan Active`,
      html,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawBody = await getRawBody(req);
  const signature = req.headers['stripe-signature'];

  const isValid = await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  if (!isValid) return res.status(400).json({ error: 'Invalid signature' });

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { type, data } = event;
  const obj = data?.object;

  try {
    switch (type) {
      case 'payment_intent.succeeded': {
        const email = obj.receipt_email || obj.metadata?.email;
        const tier = obj.metadata?.tier || 'foundation';
        if (email) {
          await updateUserPaymentStatus(email, tier, obj.customer, null, 'active');
          await sendWelcomeEmail(email, obj.metadata?.name, tier);
          // Admin notification
          if (RESEND_KEY) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
              body: JSON.stringify({
                from: 'HyCRE.ai <notifications@hycre.ai>',
                to: ['derekhuit@gmail.com'],
                subject: `💰 Payment Confirmed — ${email} | ${tier?.toUpperCase()} | $${(obj.amount/100).toFixed(2)}`,
                html: `<div style="font-family:sans-serif;padding:20px;"><h2 style="color:#C49A28;">Payment Confirmed</h2><p>Email: ${email}</p><p>Plan: ${tier?.toUpperCase()}</p><p>Amount: $${(obj.amount/100).toFixed(2)}</p><p>Stripe ID: ${obj.id}</p></div>`,
              }),
            });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const email = obj.metadata?.email;
        const tier = obj.metadata?.tier;
        const status = obj.status === 'active' ? 'active' : 'inactive';
        if (email) {
          await updateUserPaymentStatus(email, tier, obj.customer, obj.id, status);
          if (type === 'customer.subscription.created') {
            await sendWelcomeEmail(email, obj.metadata?.name, tier);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const email = obj.metadata?.email;
        if (email) {
          await updateUserPaymentStatus(email, null, obj.customer, obj.id, 'cancelled');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const email = obj.customer_email;
        if (email && RESEND_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
            body: JSON.stringify({
              from: 'HyCRE.ai <billing@hycre.ai>',
              to: [email],
              subject: 'Action required: Payment failed for HyCRE.ai',
              html: `<div style="font-family:sans-serif;padding:20px;background:#07090F;color:#DDE2EE;border-radius:12px;"><h2 style="color:#C04848;">Payment Failed</h2><p>We couldn't process your HyCRE.ai subscription payment. Please update your payment method to maintain access.</p><a href="https://hycre.ai/billing" style="background:#C49A28;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Update Payment Method →</a></div>`,
            }),
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return res.status(200).json({ received: true });
}
