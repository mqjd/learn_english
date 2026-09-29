import type { ThemeConfig } from './options';

let themeConfig: ThemeConfig | undefined;

export function setThemeConfig(config: ThemeConfig): void {
	themeConfig = config;
}

export function getThemeConfig(): ThemeConfig {
	if (!themeConfig) {
		throw new Error(
			'[starlight-theme-blog] Theme config was read before the plugin ran. Ensure the plugin is registered in starlight({ plugins: [...] }).',
		);
	}
	return themeConfig;
}
