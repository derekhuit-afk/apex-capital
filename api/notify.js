export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, name, email, tier, amount } = req.body;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  let subject = '';
  let html = '';

  if (type === 'new_signup') {
    subject = `🔔 New HyCRE.ai Signup — ${name} (${tier?.toUpperCase()})`;
    html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#07090F;color:#DDE2EE;padding:32px;border-radius:12px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#C49A28,#E8BB44);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#07090F;font-size:18px;font-family:Georgia,serif;">H</div>
          <span style="font-family:Georgia,serif;font-size:20px;color:#fff;font-weight:600;">Hy<span style="color:#C49A28">CRE</span>.ai</span>
        </div>
        <h2 style="color:#E8BB44;font-family:Georgia,serif;font-size:24px;margin:0 0 20px;">New Account Created</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;color:#58688A;font-size:13px;border-bottom:1px solid #192030;">Name</td><td style="padding:10px 0;color:#fff;font-size:13px;border-bottom:1px solid #192030;text-align:right;">${name}</td></tr>
          <tr><td style="padding:10px 0;color:#58688A;font-size:13px;border-bottom:1px solid #192030;">Email</td><td style="padding:10px 0;color:#fff;font-size:13px;border-bottom:1px solid #192030;text-align:right;">${email}</td></tr>
          <tr><td style="padding:10px 0;color:#58688A;font-size:13px;border-bottom:1px solid #192030;">Plan</td><td style="padding:10px 0;color:#E8BB44;font-size:13px;border-bottom:1px solid #192030;text-align:right;font-weight:600;">${tier?.toUpperCase()}</td></tr>
          <tr><td style="padding:10px 0;color:#58688A;font-size:13px;">Amount</td><td style="padding:10px 0;color:#38A870;font-size:15px;font-weight:700;text-align:right;">${amount}</td></tr>
        </table>
        <p style="margin-top:24px;color:#58688A;font-size:11px;">HyCRE.ai · A Huit.AI Product · Built From Alaska.</p>
      </div>
    `;
  }

  if (type === 'password_reset') {
    subject = `🔑 HyCRE.ai Password Reset — ${email}`;
    html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#07090F;color:#DDE2EE;padding:32px;border-radius:12px;">
        <h2 style="color:#E8BB44;font-family:Georgia,serif;font-size:24px;margin:0 0 16px;">Password Reset Requested</h2>
        <p style="color:#DDE2EE;font-size:14px;margin:0 0 8px;">Email: <strong style="color:#fff;">${email}</strong></p>
        <p style="color:#58688A;font-size:13px;">Reset link sent to user. Review if suspicious.</p>
        <p style="margin-top:24px;color:#58688A;font-size:11px;">HyCRE.ai · A Huit.AI Product</p>
      </div>
    `;
  }

  if (!RESEND_KEY) {
    // Log to console if no key — still returns success so UX isn't blocked
    console.log(`[NOTIFY] ${subject} | ${email}`);
    return res.status(200).json({ sent: false, reason: 'No RESEND_API_KEY configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'HyCRE.ai <notifications@hycre.ai>',
        to: ['derekhuit@gmail.com'],
        subject,
        html,
      }),
    });

    const data = await response.json();
    return res.status(200).json({ sent: true, id: data.id });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(200).json({ sent: false, error: err.message });
  }
}
