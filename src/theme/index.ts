import starlight from '@astrojs/starlight';
import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types';
import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { findDirsNeedingIndex } from './directory-index';
import {
	splitThemeOptions,
	type ThemeConfig,
	type ThemeUserConfig,
} from './options';
import { adaptSidebarForDocsDir } from './sidebar';

export type { ThemeUserConfig, ThemeConfig, NavItem, ThemeNavLink } from './options';
export { docsLoader, docsCategoryLoader, i18nLoader, DEFAULT_DOCS_DIR } from './loader';
export { docsSchema, docsCategorySchema, i18nSchema } from './schema';

/** Starlight config plus theme-only options. Replaces `starlight()` in `integrations`. */
export type StarlightThemeBlogUserConfig = StarlightUserConfig & ThemeUserConfig;

const VIRTUAL_MODULE_ID = 'virtual:starlight-theme-blog/config';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const MASONRY_MODULE_ID = 'virtual:starlight-theme-blog/masonry';

function vitePlugin(options: ThemeConfig) {
	const masonryComponents = fileURLToPath(
		new URL('../plugins/masonry/components/index.ts', import.meta.url),
	);

	return {
		name: 'vite-plugin-starlight-theme-blog-config',
		resolveId(id: string) {
			if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
			if (id === MASONRY_MODULE_ID) return masonryComponents;
		},
		load(id: string) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				return `export default ${JSON.stringify(options)};`;
			}
		},
	};
}

function themeIntegration(options: ThemeConfig): AstroIntegration {
	return {
		name: 'starlight-theme-blog-integration',
		hooks: {
			'astro:config:setup': ({ updateConfig, injectRoute, config, logger }) => {
				updateConfig({
					vite: {
						plugins: [vitePlugin(options)],
					},
				});

				const projectRoot = fileURLToPath(config.root);
				const dirs = findDirsNeedingIndex(options.docsDir, projectRoot);
				const entrypoint = fileURLToPath(
					new URL('./components/DirectoryIndex.astro', import.meta.url),
				);
				for (const dir of dirs) {
					injectRoute({
						pattern: dir,
						entrypoint,
						prerender: true,
					});
				}
				if (dirs.length > 0) {
					logger.info(
						`Directory index pages: ${dirs.map((dir) => `/${dir}/`).join(', ')}`,
					);
				}
			},
		},
	};
}

/** Internal Starlight plugin that applies theme CSS, components, and middleware. */
function themePlugin(options: ThemeConfig): StarlightPlugin {
	return {
		name: 'starlight-theme-blog',
		hooks: {
			'config:setup'({ config, updateConfig, addRouteMiddleware, addIntegration, logger }) {
				const themeCss = fileURLToPath(new URL('./styles/theme.css', import.meta.url));
				const componentsDir = fileURLToPath(new URL('./components', import.meta.url));
				const docsDir = options.docsDir.replace(/\\/g, '/').replace(/\/+$/, '');

				addIntegration(themeIntegration(options));

				if (config.sidebar) {
					logger.info(
						'Autogenerating sidebar from the docs collection; ignoring manual `sidebar` config.',
					);
				}
				// Whole docs tree from the content collection; route middleware
				// filters to the current top-level section per request.
				const sidebar = adaptSidebarForDocsDir(undefined, docsDir);

				updateConfig({
					customCss: [themeCss, ...(config.customCss ?? [])],
					components: {
						Header: `${componentsDir}/Header.astro`,
						Footer: `${componentsDir}/Footer.astro`,
						Sidebar: `${componentsDir}/Sidebar.astro`,
						Hero: `${componentsDir}/Hero.astro`,
						PageFrame: `${componentsDir}/PageFrame.astro`,
						ThemeSelect: `${componentsDir}/ThemeSelect.astro`,
						SocialIcons: `${componentsDir}/SocialIcons.astro`,
						TwoColumnContent: `${componentsDir}/TwoColumnContent.astro`,
						...config.components,
					},
					markdown: {
						...config.markdown,
						processedDirs: [
							`./${docsDir}`,
							...(config.markdown?.processedDirs ?? []),
						],
					},
					sidebar,
					...(options.hideTableOfContents ? { tableOfContents: false } : {}),
				});

				addRouteMiddleware({
					entrypoint: fileURLToPath(new URL('./middleware.ts', import.meta.url)),
					order: 'pre',
				});

				logger.info(
					`Theme applied (docs: ${docsDir}/, navs: ${options.navs.length})`,
				);
			},
		},
	};
}

/**
 * Starlight theme integration — use this instead of `starlight()` in `astro.config`.
 *
 * Content lives in a root-level docs directory (default `docs/`), separate from
 * theme components under `src/`. Pass the same path to `docsLoader({ base })`
 * in `src/content.config.ts`.
 *
 * Sidebar sections come from the docs content collection; `navs` only controls
 * which sections appear in the header.
 *
 * @example
 * ```js
 * import starlightThemeBlog from './src/theme/index.ts';
 * export default defineConfig({
 *   integrations: [
 *     starlightThemeBlog({
 *       title: 'My Docs',
 *       docsDir: 'docs',
 *       accentColor: '#0d9488',
 *       // Only these appear in the header; all docs/ subdirs remain accessible.
 *       navs: [
 *         { label: 'Guides', dirName: 'guides' },
 *         { label: 'Reference', dirName: 'reference' },
 *       ],
 *     }),
 *   ],
 * });
 * ```
 */
export default function starlightThemeBlog(
	userConfig: StarlightThemeBlogUserConfig,
): ReturnType<typeof starlight> {
	const { theme, rest } = splitThemeOptions(userConfig);
	const { plugins = [], ...starlightConfig } = rest;

	return starlight({
		...starlightConfig,
		plugins: [themePlugin(theme), ...plugins],
	});
}
