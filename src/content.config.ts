import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import {
	docsLoader,
	docsCategoryLoader,
	postsLoader,
	DEFAULT_DOCS_DIR,
	DEFAULT_POSTS_DIR,
} from './theme/loader';
import { docsSchema, docsCategorySchema } from './theme/schema';

export const collections = {
	docs: defineCollection({
		// Keep `base` in sync with `docsDir` in astro.config (starlightThemeBlog options).
		loader: docsLoader({ base: DEFAULT_DOCS_DIR }),
		schema: docsSchema({
			extend: z.object({
				tags: z.array(z.string()).optional(),
				date: z.coerce.date().optional(),
			}),
		}),
	}),
	docsCategories: defineCollection({
		loader: docsCategoryLoader({ base: DEFAULT_DOCS_DIR }),
		schema: docsCategorySchema(),
	}),
	posts: defineCollection({
		// Keep `base` in sync with `postsDir` in astro.config (starlightThemeBlog options).
		loader: postsLoader({ base: DEFAULT_POSTS_DIR }),
		schema: docsSchema({
			extend: ({ image }) =>
				z.object({
					tags: z.array(z.string()).optional(),
					date: z.coerce.date().optional(),
					image: image().optional(),
				}),
		}),
	}),
};
