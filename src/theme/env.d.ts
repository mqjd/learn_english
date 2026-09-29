declare module 'virtual:starlight-theme-blog/config' {
	const config: import('./options').ThemeConfig;
	export default config;
}

declare namespace App {
	interface Locals {
		theme: import('./options').ThemeConfig;
		themeNavs: import('./options').ThemeNavLink[];
	}
}
