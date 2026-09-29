import { glob, type Loader, type LoaderContext } from 'astro/loaders';

/** Default docs directory relative to the project root. */
export const DEFAULT_DOCS_DIR = 'docs';

// Match Starlight's docsLoader extensions:
// https://github.com/withastro/starlight/blob/main/packages/starlight/src/loaders.ts
const docsExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'mdwn', 'md', 'mdx'];
const i18nExtensions = ['json', 'yml', 'yaml'];

type GlobOptions = Parameters<typeof glob>[0];
type GenerateIdFunction = NonNullable<GlobOptions['generateId']>;

export interface DocsLoaderOptions {
	/**
	 * Directory containing Markdown/MDX docs, relative to the project root.
	 * Keep this in sync with `docsDir` passed to `starlightThemeBlog()`.
	 * @default 'docs'
	 */
	base?: string;
	/**
	 * Function that generates an ID for an entry.
	 * Default implementation generates a slug from the entry path.
	 */
	generateId?: GenerateIdFunction;
}

/**
 * Loads content from a configurable root-level docs directory (default: `docs/`),
 * ignoring filenames starting with `_`.
 *
 * Unlike Starlight's built-in `docsLoader()`, this does not hardcode `src/content/docs`.
 */
export function docsLoader({
	base = DEFAULT_DOCS_DIR,
	generateId,
}: DocsLoaderOptions = {}): Loader {
	return {
		name: 'starlight-theme-blog-docs-loader',
		load: createDocsLoadFn(base, generateId),
	};
}

/**
 * Loads data files from `src/content/i18n/`, ignoring filenames starting with `_`.
 */
export function i18nLoader(): Loader {
	return {
		name: 'starlight-theme-blog-i18n-loader',
		load: (context: LoaderContext) => {
			return glob({
				base: 'src/content/i18n',
				pattern: `**/[^_]*.{${i18nExtensions.join(',')}}`,
			}).load(context);
		},
	};
}

export interface DocsCategoryLoaderOptions {
	/**
	 * Directory containing docs (and `_category_.json` files), relative to the project root.
	 * Keep in sync with `docsLoader({ base })` / `docsDir`.
	 * @default 'docs'
	 */
	base?: string;
}

/**
 * Loads Docusaurus-style `_category_.json` files from the docs tree.
 * Entry `id` is the directory path (e.g. `peppa-pig/s1`).
 */
export function docsCategoryLoader({
	base = DEFAULT_DOCS_DIR,
}: DocsCategoryLoaderOptions = {}): Loader {
	return {
		name: 'starlight-theme-blog-docs-category-loader',
		load: (context: LoaderContext) => {
			return glob({
				base,
				pattern: '**/_category_.json',
				generateId: ({ entry }) =>
					entry.replace(/\\/g, '/').replace(/\/_category_\.json$/i, ''),
			}).load(context);
		},
	};
}

function createDocsLoadFn(base: string, generateId?: GenerateIdFunction): Loader['load'] {
	return (context: LoaderContext) => {
		const extensions = [...docsExtensions];

		if (context.config.integrations.find(({ name }) => name === '@astrojs/markdoc')) {
			extensions.push('mdoc');
		}

		const options: GlobOptions = {
			base,
			pattern: `**/[^_]*.{${extensions.join(',')}}`,
		};
		if (generateId) options.generateId = generateId;

		return glob(options).load(context);
	};
}
