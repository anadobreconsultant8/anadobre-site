export const prerender = false;
import type { APIRoute } from 'astro';
import { sendEmailWithPDF } from '../../lib/send-email';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cfEnv = (locals as any).runtime?.env ?? {};
    const RESEND_API_KEY = cfEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { prenume, email, companie, scor, nivel, pdfBase64 } = await request.json();

    if (!prenume || !email || !pdfBase64) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    await sendEmailWithPDF({ prenume, email, companie, scor, nivel, pdfBase64, apiKey: RESEND_API_KEY });

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('send-report error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
