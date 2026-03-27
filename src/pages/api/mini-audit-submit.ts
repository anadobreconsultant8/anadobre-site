export const prerender = false;

import type { APIRoute } from 'astro';
import { createACContact } from '../../lib/activecampaign';
import { sendEmailWithPDF } from '../../lib/send-email';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Citește variabilele din Cloudflare runtime (funcționează în producție)
    const cfEnv = (locals as any).runtime?.env ?? {};
    const RESEND_API_KEY = cfEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
    const AC_API_URL    = cfEnv.AC_API_URL    || import.meta.env.AC_API_URL;
    const AC_API_KEY    = cfEnv.AC_API_KEY    || import.meta.env.AC_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend API key not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

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
      await createACContact({ prenume, email, companie, scor, nivel, apiUrl: AC_API_URL, apiKey: AC_API_KEY });
    } catch (acError) {
      console.error('AC integration error (non-fatal):', acError);
      // Continuăm — mai important e că lead-ul primește PDF-ul
    }

    // 3. Trimite email cu PDF
    await sendEmailWithPDF({ prenume, email, companie, scor, nivel, pdfBase64, apiKey: RESEND_API_KEY });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Mini-audit submit error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
