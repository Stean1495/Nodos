// /api/createTransaction.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, currency = 'COP', customerEmail, paymentMethod, phone, productName } = req.body;

    if (!amount || !customerEmail || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ENV = process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox';
    const baseUrl =
      ENV === 'production'
        ? 'https://production.wompi.co/v1/transactions'
        : 'https://sandbox.wompi.co/v1/transactions';

    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    if (!privateKey) return res.status(500).json({ error: 'WOMPI_PRIVATE_KEY not configured' });

    const amountInCents = Math.round(Number(amount) * 100);

    const transactionBody = {
      amount_in_cents: amountInCents,
      currency,
      customer_email: customerEmail,
      reference: `NODA_${Date.now()}`,
      redirect_url: process.env.PAYMENT_RETURN_URL || 'https://noda.tech/payment/confirmation',
      metadata: { productName: productName || 'Producto NODA' },
      payment_method: {}
    };

    // 💡 Aquí definimos correctamente el método de pago
    if (paymentMethod === 'NEQUI') {
      transactionBody.payment_method = { type: 'NEQUI', phone_number: phone };
    } else if (paymentMethod === 'PSE') {
      transactionBody.payment_method = {
        type: 'PSE',
        user_type: 0,
        user_legal_id: '123456789',
        user_legal_id_type: 'CC'
      };
    } else {
      transactionBody.payment_method = { type: paymentMethod };
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionBody)
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('createTransaction error', err);
    return res.status(500).json({ error: err.message });
  }
}
