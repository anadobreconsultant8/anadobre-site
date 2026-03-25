import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.string(),
    image: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };
