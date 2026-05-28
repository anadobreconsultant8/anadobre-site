import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

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
    },
    items: sorted.map((post) => {
      const imageUrl = post.data.image
        ? `${context.site}${post.data.image.replace(/^\//, '')}`
        : undefined;

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: post.data.excerpt ?? '',
        link: `/blog/${post.slug}/`,
        customData: imageUrl
          ? `<media:content url="${imageUrl}" medium="image" />`
          : '',
      };
    }),
    customData: `<language>ro</language>`,
  });
}
