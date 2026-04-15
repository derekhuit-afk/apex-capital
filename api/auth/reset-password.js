const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, token, newPassword } = req.body;

  // ─── REQUEST RESET ───
  if (action === 'request') {
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
      // Generate reset link via Supabase Admin
      const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'recovery',
          email,
          options: { redirect_to: 'https://hycre.ai?mode=reset' },
        }),
      });

      const linkData = await linkRes.json();

      if (!linkRes.ok) {
        // Don't reveal if email exists
        return res.status(200).json({ success: true });
      }

      const resetLink = linkData.action_link;

      // Send via Resend
      if (RESEND_KEY && resetLink) {
        const html = `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#07090F;color:#DDE2EE;padding:36px;border-radius:12px;">
            <div style="margin-bottom:24px;"><span style="font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:600;">Hy<span style="color:#C49A28">CRE</span>.ai</span></div>
            <h2 style="color:#fff;font-family:Georgia,serif;font-size:26px;margin:0 0 12px;">Reset Your Password</h2>
            <p style="color:#58688A;font-size:14px;margin:0 0 28px;line-height:1.6;">Click the button below to reset your HyCRE.ai password. This link expires in 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;background:linear-gradient(90deg,#C49A28,#E8BB44);color:#07090F;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;margin-bottom:24px;">Reset Password →</a>
            <p style="color:#252F42;font-size:12px;margin:16px 0 0;">If you didn't request this, ignore this email. Your password won't change.</p>
            <p style="margin-top:24px;color:#252F42;font-size:11px;">HyCRE.ai · A Huit.AI Product · Built From Alaska.</p>
          </div>
        `;

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
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: 'HyCRE.ai <notifications@hycre.ai>',
            to: ['derekhuit@gmail.com'],
            subject: `🔑 Password Reset Requested — ${email}`,
            html: `<p style="font-family:sans-serif;">Password reset requested for <strong>${email}</strong> on HyCRE.ai.</p>`,
          }),
        });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Reset request error:', err);
      return res.status(200).json({ success: true }); // Always return success to prevent email enumeration
    }
  }

  // ─── CONFIRM NEW PASSWORD ───
  if (action === 'confirm') {
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    try {
      // Exchange recovery token for session, then update password
      const sessionRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await sessionRes.json();
      if (!sessionRes.ok) return res.status(400).json({ error: 'Invalid or expired reset link' });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Password reset failed' });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
