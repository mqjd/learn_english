import { defineCollection } from 'astro:content';
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
		schema: docsSchema(),
	}),
	docsCategories: defineCollection({
		loader: docsCategoryLoader({ base: DEFAULT_DOCS_DIR }),
		schema: docsCategorySchema(),
	}),
};
