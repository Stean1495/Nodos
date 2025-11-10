// /api/webhook.js
// Endpoint que la pasarela llamará cuando cambie el estado de la transacción (IPN / webhook).
export default async function handler(req, res) {
  // Muchas pasarelas piden POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;
    // Opcional: verificar firma / token (depende del proveedor). Revisa doc para validar requests.
    // Ejemplo genérico:
    // const signature = req.headers['x-provider-signature'];
    // verificar signature usando la clave pública/secret provista por la pasarela.

    console.log('Webhook payload:', JSON.stringify(payload).slice(0,1000));

    // Ejemplo de procesamiento:
    // - actualizar orden en tu DB (Supabase)
    // - marcar transacción como 'paid' si payload indica 'PAID' o similar
    // - enviar correo, generar acceso al curso, etc.

    // EJEMPLO: si usas Supabase puedes llamar aquí a Supabase con una SERVICE_ROLE_KEY (server-side)
    // para actualizar la tabla de órdenes. No uses ANON key aquí.

    // Responder 200 a la pasarela
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).json({ error: err.message });
  }
}
