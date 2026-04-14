export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ZENOPAY_KEY = process.env.ZENOPAY_API_KEY;
  const { tier, name, email, amount, period, card, exp, cvv } = req.body;

  if (!tier || !email || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // ZenoPay payment intent payload
  const payload = {
    amount: parseAmount(amount),
    currency: 'usd',
    customer: { name, email },
    description: `HyCRE.ai — ${tier.toUpperCase()} Plan`,
    metadata: {
      product: 'hycre.ai',
      tier,
      period,
      source: 'hycre_checkout',
    },
    payment_method: {
      card: {
        number: card?.replace(/\s/g, ''),
        exp_month: exp?.split('/')[0],
        exp_year: '20' + exp?.split('/')[1],
        cvc: cvv,
      },
    },
    receipt_email: email,
    ...(period === '/mo' || period === 'month' ? {
      recurring: {
        interval: 'month',
        interval_count: 1,
      }
    } : {}),
  };

  if (!ZENOPAY_KEY) {
    // Dev mode — simulate success
    console.log(`[ZENOPAY DEV] Payment for ${email} | ${tier} | ${amount}`);
    return res.status(200).json({
      success: true,
      transaction_id: 'dev_' + Date.now(),
      status: 'succeeded',
      dev_mode: true,
    });
  }

  try {
    const response = await fetch('https://api.zenopay.ai/v1/payment-intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZENOPAY_KEY}`,
        'X-Source': 'hycre.ai',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        error: data.error?.message || data.message || 'Payment failed',
        code: data.error?.code,
      });
    }

    return res.status(200).json({
      success: true,
      transaction_id: data.id,
      status: data.status,
      amount: data.amount,
    });
  } catch (err) {
    console.error('ZenoPay error:', err);
    return res.status(500).json({ error: 'Payment processing error' });
  }
}

function parseAmount(amountStr) {
  // Converts "$2,995" or "$249" to cents: 299500 or 24900
  const num = parseFloat(amountStr?.replace(/[$,]/g, '') || '0');
  return Math.round(num * 100);
}
