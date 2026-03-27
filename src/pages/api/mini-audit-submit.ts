export const prerender = false;

import type { APIRoute } from 'astro';
import { createACContact } from '../../lib/activecampaign';
import { sendEmailWithPDF } from '../../lib/send-email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prenume, email, companie, scor, nivel, raspunsuri, pdfBase64 } = body;

    // Validare
    if (!prenume || !email || !companie || scor === undefined || !nivel || !raspunsuri || !pdfBase64) {
      return new Response(JSON.stringify({ error: 'C\u00e2mpuri lips\u0103' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return new Response(JSON.stringify({ error: 'Email invalid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PDF-ul vine gata generat din browser (client-side)

    // 2. Creează contact în ActiveCampaign (non-blocking)
    try {
      await createACContact({ prenume, email, companie, scor, nivel });
    } catch (acError) {
      console.error('AC integration error (non-fatal):', acError);
      // Continuăm — mai important e că lead-ul primește PDF-ul
    }

    // 3. Trimite email cu PDF
    await sendEmailWithPDF({ prenume, email, companie, scor, nivel, pdfBase64 });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Mini-audit submit error:', error);
    return new Response(
      JSON.stringify({ error: 'A ap\u0103rut o eroare. Te rog \u00eencearc\u0103 din nou.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
