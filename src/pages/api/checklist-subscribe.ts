export const prerender = false;
import type { APIRoute } from 'astro';

const N8N_WEBHOOK = 'https://n8n.altia.work/webhook-test/fabaa028-820d-47ea-93f0-dbbb03ac88e4';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prenume, email, gdpr, marketing } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email lipsă' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Push spre n8n — fire & forget
    fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'checklist-7-semne',
        prenume: prenume || '',
        email,
        gdpr: gdpr || 'off',
        marketing: marketing || 'off',
      }),
    }).catch((err) => console.error('[checklist-subscribe] n8n push failed:', err));

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[checklist-subscribe] error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
