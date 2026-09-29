/** Add Astro's configured base path to an internal absolute path. */
export function withBasePath(pathname: string, base: string): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const basePrefix = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;

	if (!basePrefix || path === basePrefix || path.startsWith(`${basePrefix}/`)) return path;
	return `${basePrefix}${path}`;
}

/** Remove Astro's configured base path for route matching and content lookup. */
export function stripBasePath(pathname: string, base: string): string {
	const basePrefix = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;

	if (!basePrefix) return pathname;
	if (pathname === basePrefix) return '/';
	if (pathname.startsWith(`${basePrefix}/`)) return pathname.slice(basePrefix.length);
	return pathname;
}
