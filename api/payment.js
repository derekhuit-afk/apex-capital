export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  const ZENOPAY_KEY = process.env.ZENOPAY_API_KEY;
  const { tier, name, email, amount, period, card, exp, cvv } = req.body;

  if (!tier || !email || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const amountCents = Math.round(parseFloat((amount || '0').replace(/[$,]/g, '')) * 100);
  const isRecurring = period === '/mo';

  // Try ZenoPay first, fall back to Stripe
  if (ZENOPAY_KEY) {
    try {
      const response = await fetch('https://api.zenopay.ai/v1/payment-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ZENOPAY_KEY}`,
          'X-Source': 'hycre.ai',
          'X-Version': '1.0',
        },
        body: JSON.stringify({
          amount: amountCents,
          currency: 'usd',
          customer: { name, email },
          description: `HyCRE.ai — ${tier.toUpperCase()} Plan`,
          metadata: { product: 'hycre.ai', tier, period },
          payment_method: {
            card: {
              number: card?.replace(/\s/g, ''),
              exp_month: exp?.split('/')[0],
              exp_year: '20' + exp?.split('/')[1],
              cvc: cvv,
            },
          },
          receipt_email: email,
          ...(isRecurring ? { recurring: { interval: 'month', interval_count: 1 } } : {}),
        }),
      });
      const data = await response.json();
      if (response.ok && data.id) {
        return res.status(200).json({ success: true, transaction_id: data.id, status: data.status, processor: 'zenopay' });
      }
    } catch (err) {
      console.log('ZenoPay failed, falling back to Stripe:', err.message);
    }
  }

  // Stripe fallback
  if (!STRIPE_KEY) {
    // Dev simulation
    console.log(`[DEV PAYMENT] ${email} | ${tier} | ${amount}`);
    return res.status(200).json({ success: true, transaction_id: 'dev_' + Date.now(), status: 'succeeded', processor: 'dev' });
  }

  try {
    // Create payment method
    const pmRes = await fetch('https://api.stripe.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        type: 'card',
        'card[number]': card?.replace(/\s/g, ''),
        'card[exp_month]': exp?.split('/')[0],
        'card[exp_year]': '20' + exp?.split('/')[1],
        'card[cvc]': cvv,
        'billing_details[name]': name,
        'billing_details[email]': email,
      }),
    });
    const pm = await pmRes.json();
    if (!pmRes.ok) return res.status(400).json({ error: pm.error?.message || 'Invalid card details' });

    // Create & confirm payment intent
    const piRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountCents,
        currency: 'usd',
        payment_method: pm.id,
        confirm: 'true',
        receipt_email: email,
        description: `HyCRE.ai — ${tier.toUpperCase()} Plan`,
        'metadata[product]': 'hycre.ai',
        'metadata[tier]': tier,
      }),
    });
    const pi = await piRes.json();
    if (!piRes.ok || pi.status === 'requires_action') {
      return res.status(400).json({ error: pi.error?.message || '3D Secure required — please use a different card.' });
    }
    return res.status(200).json({ success: true, transaction_id: pi.id, status: pi.status, processor: 'stripe' });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Payment processing error. Please try again.' });
  }
}
