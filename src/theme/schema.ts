import { docsSchema as starlightDocsSchema, i18nSchema as starlightI18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export function docsSchema(...args: Parameters<typeof starlightDocsSchema>) {
	return starlightDocsSchema(...args);
}

export function i18nSchema(...args: Parameters<typeof starlightI18nSchema>) {
	return starlightI18nSchema(...args);
}

/** Schema for Docusaurus-style `_category_.json` entries. */
export function docsCategorySchema() {
	return z.object({
		label: z.string().optional(),
		position: z.number().optional(),
	});
}
