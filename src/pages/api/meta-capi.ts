export const prerender = false;
import type { APIRoute } from 'astro';

const PIXEL_ID = '550648992497208';
const META_API_VERSION = 'v19.0';

async function sha256hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const cfEnv = (locals as any).runtime?.env ?? {};
  const token = cfEnv.META_CAPI_TOKEN || import.meta.env.META_CAPI_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: 'META_CAPI_TOKEN not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { event_name, event_id, email, page_url, custom_data } = body;

  const clientIp = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || '';
  const userAgent = request.headers.get('User-Agent') || '';

  const userData: Record<string, any> = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
  };

  if (email) {
    userData.em = [await sha256hex(email)];
  }

  const cookieHeader = request.headers.get('Cookie') || '';
  const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/);
  const fbpMatch = cookieHeader.match(/_fbp=([^;]+)/);
  if (fbcMatch) userData.fbc = fbcMatch[1];
  if (fbpMatch) userData.fbp = fbpMatch[1];

  const eventPayload: Record<string, any> = {
    event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: page_url || 'https://anadobre.com',
    action_source: 'website',
    user_data: userData,
  };

  if (event_id) eventPayload.event_id = event_id;
  if (custom_data && Object.keys(custom_data).length > 0) eventPayload.custom_data = custom_data;

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${PIXEL_ID}/events?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventPayload] }),
    }
  );

  const result = await res.json();

  return new Response(JSON.stringify(result), {
    status: res.ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json' },
  });
};
