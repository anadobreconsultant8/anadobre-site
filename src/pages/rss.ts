// Același feed ca /rss.xml, servit la anadobre.com/rss (ex. pentru Zapier).
// Randat de worker ca să păstreze Content-Type: application/xml.
import { GET } from '../lib/rss-feed';

export const prerender = false;
export { GET };
export const HEAD = GET;
