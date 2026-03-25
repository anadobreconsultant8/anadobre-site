// NOTE: For static deployment (Cloudflare Pages / Netlify static), this endpoint
// needs to be replaced with a serverless function or a third-party form service.
// For now, forms handle errors gracefully on the client side (show success on catch).
// TODO: Convert to Netlify Function or Cloudflare Worker for production.

// Placeholder export to satisfy Astro static build
export const prerender = true;

export async function GET() {
  return new Response(JSON.stringify({ message: 'Use POST from a serverless function' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
