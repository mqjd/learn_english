import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import {
	docsLoader,
	docsCategoryLoader,
	DEFAULT_DOCS_DIR,
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
};
