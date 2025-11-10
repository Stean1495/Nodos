// /api/webhook.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secret = process.env.WOMPI_WEBHOOK_SECRET || 'test_integrity_WC61fEpAPS0qkeQoyJC0Ivjc7cpyaqkg';

    // 🧩 1. Capturar el evento enviado por Wompi
    const event = req.body;

    // 🧩 2. Validar integridad (opcional pero recomendado)
    const signature = req.headers['x-signature-integrity'] || req.headers['X-Signature-Integrity'];

    if (signature) {
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(event))
        .digest('hex');

      if (computedSignature !== signature) {
        console.warn('❌ Firma de webhook inválida');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    // 🧠 3. Procesar el evento según el estado del pago
    const transaction = event.data?.transaction || {};
    const status = transaction.status;
    const reference = transaction.reference;
    const id = transaction.id;

    console.log(`💬 Webhook recibido: transacción ${id} (${reference}) - Estado: ${status}`);

    // Aquí podrías guardar en tu base de datos si quieres
    // Ejemplo:
    /*
    import { createClient } from '@supabase/supabase-js';
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    await supabase.from('transactions').insert({
      wompi_id: id,
      reference,
      status,
      raw_data: event
    });
    */

    // 🟢 Responder a Wompi que recibiste el evento
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
