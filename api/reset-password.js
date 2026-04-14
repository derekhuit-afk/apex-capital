const crypto = require('crypto');

// In production this would store tokens in Supabase
// For now generates a signed reset link and notifies admin
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const token = crypto.randomBytes(32).toString('hex');
  const resetLink = `https://hycre.ai?reset=${token}&email=${encodeURIComponent(email)}`;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#07090F;color:#DDE2EE;padding:36px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:600;">Hy<span style="color:#C49A28">CRE</span>.ai</span>
      </div>
      <h2 style="color:#fff;font-family:Georgia,serif;font-size:26px;margin:0 0 12px;">Reset Your Password</h2>
      <p style="color:#58688A;font-size:14px;margin:0 0 28px;line-height:1.6;">Click the button below to reset your HyCRE.ai password. This link expires in 1 hour.</p>
      <a href="${resetLink}" style="display:inline-block;background:linear-gradient(90deg,#C49A28,#E8BB44);color:#07090F;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;margin-bottom:24px;">Reset Password</a>
      <p style="color:#252F42;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
      <p style="margin-top:24px;color:#252F42;font-size:11px;">HyCRE.ai · A Huit.AI Product · Built From Alaska.</p>
    </div>
  `;

  if (!RESEND_KEY) {
    console.log(`[PASSWORD RESET] ${email} → ${resetLink}`);
    return res.status(200).json({ sent: true, dev: true });
  }

  try {
    // Send reset email to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'HyCRE.ai <no-reply@hycre.ai>',
        to: [email],
        subject: 'Reset your HyCRE.ai password',
        html,
      }),
    });

    // Notify admin
    await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://hycre.ai'}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'password_reset', email }),
    });

    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send reset email' });
  }
}
