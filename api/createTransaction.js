// /api/createTransaction.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: '✅ API funcionando correctamente en Vercel' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'COP', customerEmail, paymentMethod, phone, productName } = req.body;

    if (!amount || !customerEmail || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ENV = process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox';
    const baseUrl =
      ENV === 'production'
        ? 'https://production.wompi.co/v1'
        : 'https://sandbox.wompi.co/v1';

    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    const publicKey = process.env.WOMPI_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      return res.status(500).json({ error: 'WOMPI keys not configured' });
    }

    // ✅ 1. Obtener el acceptance_token desde Wompi
    const merchantResponse = await fetch(`${baseUrl}/merchants/${publicKey}`);
    const merchantData = await merchantResponse.json();
    const acceptance_token = merchantData.data.presigned_acceptance.acceptance_token;

    // ✅ 2. Preparar cuerpo de la transacción
    const amountInCents = Math.round(Number(amount) * 100);

    const transactionBody = {
      amount_in_cents: amountInCents,
      currency,
      customer_email: customerEmail,
      reference: `NODA_${Date.now()}`,
      acceptance_token,
      redirect_url: process.env.PAYMENT_RETURN_URL || 'https://nodos.vercel.app/pago-exitoso.html',
      payment_method: {},
      metadata: { productName: productName || 'Producto Nodos' }
    };

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

    // ✅ 3. Crear la transacción
    const response = await fetch(`${baseUrl}/transactions`, {
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
