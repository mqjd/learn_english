import { DEFAULT_DOCS_DIR, DEFAULT_POSTS_DIR } from './loader';

/** Top-nav item mapped to a docs subdirectory or an explicit internal route. */
export type NavItem =
	| {
			/** Display label in the header nav. */
			label: string;
			/** Docs subdirectory name; also used as the URL slug prefix. */
			dirName: string;
			href?: never;
	  }
	| {
			/** Display label in the header nav. */
			label: string;
			/** Explicit internal route, such as `/tags/`. */
			href: string;
			dirName?: never;
	  };

export interface ThemeUserConfig {
	/** Accent color used for links and highlights (CSS color). */
	accentColor?: string;
	/** Font stack applied via `--sl-font`. */
	fontFamily?: string;
	/** Extra footer line shown below the default footer. */
	footerText?: string;
	/** Hide the page table of contents site-wide. */
	hideTableOfContents?: boolean;
	/**
	 * Project-root directory for Markdown/MDX docs.
	 * Must match `docsLoader({ base })` in `src/content.config.ts`.
	 * @default 'docs'
	 */
	docsDir?: string;
	/**
	 * Project-root directory for blog posts.
	 * Must match `postsLoader({ base })` in `src/content.config.ts`.
	 * Also used as the public URL prefix (`/{postsDir}/{slug}/`).
	 * @default 'posts'
	 */
	postsDir?: string;
	/**
	 * Docusaurus-style top nav sections. When non-empty, each entry becomes a
	 * header link. All `docsDir` subdirectories remain accessible via the
	 * content collection; route middleware builds per-section sidebars.
	 * `navs` only controls which sections appear in the header.
	 */
	navs?: NavItem[];
}

export interface ThemeConfig {
	accentColor: string;
	fontFamily: string;
	footerText: string;
	hideTableOfContents: boolean;
	docsDir: string;
	postsDir: string;
	navs: NavItem[];
}

/** Resolved nav entry exposed to Header via `Astro.locals.themeNavs`. */
export interface ThemeNavLink {
	label: string;
	href: string;
	active: boolean;
}

export const THEME_OPTION_KEYS = [
	'accentColor',
	'fontFamily',
	'footerText',
	'hideTableOfContents',
	'docsDir',
	'postsDir',
	'navs',
] as const satisfies readonly (keyof ThemeUserConfig)[];

const defaults: ThemeConfig = {
	accentColor: '#0d9488',
	fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
	footerText: '',
	hideTableOfContents: false,
	docsDir: DEFAULT_DOCS_DIR,
	postsDir: DEFAULT_POSTS_DIR,
	navs: [],
};

export function resolveOptions(userConfig: ThemeUserConfig = {}): ThemeConfig {
	return {
		accentColor: userConfig.accentColor ?? defaults.accentColor,
		fontFamily: userConfig.fontFamily ?? defaults.fontFamily,
		footerText: userConfig.footerText ?? defaults.footerText,
		hideTableOfContents: userConfig.hideTableOfContents ?? defaults.hideTableOfContents,
		docsDir: userConfig.docsDir ?? defaults.docsDir,
		postsDir: userConfig.postsDir ?? defaults.postsDir,
		navs: userConfig.navs ?? defaults.navs,
	};
}

/** Split theme-only options from a combined Starlight + theme config object. */
export function splitThemeOptions<T extends ThemeUserConfig>(
	userConfig: T,
): { theme: ThemeConfig; rest: Omit<T, keyof ThemeUserConfig> } {
	const themeInput: ThemeUserConfig = {};
	const rest = { ...userConfig };

	for (const key of THEME_OPTION_KEYS) {
		if (key in rest) {
			themeInput[key] = rest[key];
			delete rest[key];
		}
	}

	return { theme: resolveOptions(themeInput), rest };
}
