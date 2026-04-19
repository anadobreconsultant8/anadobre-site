import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const MARKDOWN_WRAPPER = `
function _htmlToMd(html) {
  return html
    .replace(/<script[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<style[\\s\\S]*?<\\/style>/gi, '')
    .replace(/<nav[\\s\\S]*?<\\/nav>/gi, '')
    .replace(/<footer[\\s\\S]*?<\\/footer>/gi, '')
    .replace(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/gi, '\\n# $1\\n\\n')
    .replace(/<h2[^>]*>([\\s\\S]*?)<\\/h2>/gi, '\\n## $1\\n\\n')
    .replace(/<h3[^>]*>([\\s\\S]*?)<\\/h3>/gi, '\\n### $1\\n\\n')
    .replace(/<h4[^>]*>([\\s\\S]*?)<\\/h4>/gi, '\\n#### $1\\n\\n')
    .replace(/<strong[^>]*>([\\s\\S]*?)<\\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\\s\\S]*?)<\\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\\s\\S]*?)<\\/em>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\\s\\S]*?)<\\/a>/gi, '[$2]($1)')
    .replace(/<li[^>]*>([\\s\\S]*?)<\\/li>/gi, '- $1\\n')
    .replace(/<\\/?[uo]l[^>]*>/gi, '\\n')
    .replace(/<br\\s*\\/?>/gi, '\\n')
    .replace(/<p[^>]*>([\\s\\S]*?)<\\/p>/gi, '$1\\n\\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\\n{3,}/g, '\\n\\n').trim();
}
const _astroWorker = __astrojsSsrVirtualEntry;
const _mdWorker = {
  fetch: async (request, env, ctx) => {
    const accept = request.headers.get('Accept') || '';
    const response = await _astroWorker.fetch(request, env, ctx);
    if (!accept.includes('text/markdown')) return response;
    const ct = response.headers.get('Content-Type') || '';
    if (!ct.includes('text/html')) return response;
    const html = await response.text();
    const md = _htmlToMd(html);
    return new Response(md, {
      status: response.status,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(Math.ceil(md.length / 4)),
      },
    });
  },
};
export { _mdWorker as default, pageMap };
`;

function markdownForAgents() {
  return {
    name: 'markdown-for-agents',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const workerPath = join(dir.pathname, '_worker.js', 'index.js');
        let src = readFileSync(workerPath, 'utf8');
        src = src.replace(
          /\nexport \{ __astrojsSsrVirtualEntry as default, pageMap \};\s*$/,
          MARKDOWN_WRAPPER
        );
        writeFileSync(workerPath, src, 'utf8');
      },
    },
  };
}

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind(), markdownForAgents()],
  site: 'https://anadobre.com',
});
