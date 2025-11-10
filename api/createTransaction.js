// /api/createTransaction.js
// Vercel Serverless function - crea una transacción en la pasarela (ej. Wompi)
// Reemplaza el endpoint si usas otro proveedor o si la ruta es diferente (sandbox/production).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      amount,           // número: total en pesos (ej. 149900)
      currency = 'COP',
      customerEmail,
      paymentMethod,    // 'PSE', 'NEQUI', 'DAVIPLATA', 'CASH', 'CARD' (dependiendo de la pasarela)
      productName,
      reference
    } = req.body;

    if (!amount || !customerEmail || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ajusta el endpoint sandbox / production según tu proveedor.
    // Ejemplo Wompi sandbox: https://sandbox.wompi.co/v1/transactions
    // Ejemplo Wompi production: https://production.wompi.co/v1/transactions
    const ENV = process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox';
    const baseUrl = ENV === 'production'
      ? 'https://production.wompi.co/v1/transactions'
      : 'https://sandbox.wompi.co/v1/transactions';

    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    if (!privateKey) return res.status(500).json({ error: 'WOMPI_PRIVATE_KEY not configured' });

    // Wompi (y la mayoría) espera amount en CENTAVOS (amount_in_cents)
    // Convertir a centavos
    const amountInCents = Math.round(Number(amount) * 100);

    const transactionBody = {
      // Campos base: revisa la doc oficial de la pasarela y ajusta nombres si difieren
      amount_in_cents: amountInCents,
      currency,
      customer_email: customerEmail,
      reference: reference || `NODA_${Date.now()}`,
      // redirect_url: a donde el proveedor redirigirá al cliente luego del pago
      redirect_url: process.env.PAYMENT_RETURN_URL || 'https://noda.tech/payment/confirmation',
      // metadata / description
      metadata: { productName: productName || '' }
    };

    // Para métodos que requieren indicar el tipo, algunas pasarelas aceptan `payment_method_type`
    // o `payment_method` — revisa doc y ajusta. Aquí agregamos un campo genérico.
    transactionBody.payment_method_type = paymentMethod; // ajusta si la API necesita otro nombre

    // Hacer la petición al proveedor
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${privateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionBody)
    });

    const data = await response.json();

    // Devolver al frontend toda la respuesta (útil para debugging)
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('createTransaction error', err);
    return res.status(500).json({ error: err.message });
  }
}
