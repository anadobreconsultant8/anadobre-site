export const prerender = false;
import type { APIRoute } from 'astro';

const SERVER_INFO = {
  name: 'ro.anadobre/site',
  version: '1.0.0',
};

const CAPABILITIES = {
  tools: {},
  resources: {},
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { method, id, params } = body;

  if (method === 'initialize') {
    return json(id, {
      protocolVersion: params?.protocolVersion ?? '2025-03-26',
      serverInfo: SERVER_INFO,
      capabilities: CAPABILITIES,
    });
  }

  if (method === 'tools/list') {
    return json(id, {
      tools: [
        {
          name: 'mini_audit',
          description: 'Evaluează maturitatea sistemului de marketing și vânzări al unui business B2B.',
          inputSchema: {
            type: 'object',
            properties: {
              prenume: { type: 'string' },
              email: { type: 'string', format: 'email' },
              companie: { type: 'string' },
            },
            required: ['prenume', 'email'],
          },
        },
        {
          name: 'newsletter_subscribe',
          description: 'Abonează un utilizator la newsletter.',
          inputSchema: {
            type: 'object',
            properties: {
              prenume: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['email'],
          },
        },
      ],
    });
  }

  if (method === 'resources/list') {
    return json(id, {
      resources: [
        { uri: 'https://anadobre.com/blog', name: 'Blog', mimeType: 'text/html' },
        { uri: 'https://anadobre.com/servicii', name: 'Servicii', mimeType: 'text/html' },
        { uri: 'https://anadobre.com/resurse', name: 'Resurse', mimeType: 'text/html' },
      ],
    });
  }

  if (method === 'notifications/initialized') {
    return new Response(null, { status: 204 });
  }

  return json(id, null, { code: -32601, message: 'Method not found' });
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'MCP endpoint active', server: SERVER_INFO }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

function json(id: any, result: any, error?: { code: number; message: string }) {
  const body = error
    ? { jsonrpc: '2.0', id, error }
    : { jsonrpc: '2.0', id, result };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
