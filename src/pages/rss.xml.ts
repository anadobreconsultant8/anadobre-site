import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt({ html: true });

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  const sorted = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Blog Ana Dobre — Marketing digital, automatizări și AI',
    description:
      'Articole practice despre strategie de marketing digital, automatizări, AI și creșterea afacerilor online.',
    site: context.site!,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
      content: 'http://purl.org/rss/1.0/modules/content/',
    },
    items: sorted.map((post) => {
      const imageUrl = post.data.image
        ? `${context.site}${post.data.image.replace(/^\//, '')}`
        : undefined;

      const renderedContent = sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'img', 'figure', 'figcaption', 'picture', 'source',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title', 'width', 'height'],
          a: ['href', 'title', 'target', 'rel'],
          '*': ['class'],
        },
      });

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: post.data.excerpt ?? '',
        link: `/blog/${post.slug}/`,
        content: renderedContent,
        customData: imageUrl
          ? `<media:content url="${imageUrl}" medium="image" />`
          : '',
      };
    }),
    customData: `<language>ro</language>`,
  });
}
