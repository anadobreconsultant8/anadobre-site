import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',        // static by default, SSR on demand pentru API endpoints
  adapter: cloudflare(),
  integrations: [tailwind()],
  site: 'https://anadobre.com',
});
