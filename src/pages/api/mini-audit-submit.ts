export const prerender = false;
import type { APIRoute } from 'astro';
import { createACContact } from '../../lib/activecampaign';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cfEnv = (locals as any).runtime?.env ?? {};
    const AC_API_URL = cfEnv.AC_API_URL || import.meta.env.AC_API_URL;
    const AC_API_KEY = cfEnv.AC_API_KEY || import.meta.env.AC_API_KEY;

    const { prenume, email, companie, scor, nivel } = await request.json();

    if (AC_API_URL && AC_API_KEY) {
      await createACContact({ prenume, email, companie, scor, nivel, apiUrl: AC_API_URL, apiKey: AC_API_KEY });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AC sync error:', msg);
    // Non-fatal — return success anyway
    return new Response(JSON.stringify({ success: true, warning: msg }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
};
