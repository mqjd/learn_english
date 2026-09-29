import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getCollection } from 'astro:content';
import themeConfig from 'virtual:starlight-theme-blog/config';
import {
	applyCategoryToSidebar,
	categoryMapFromCollection,
	type SidebarEntryLike,
} from './directory-index';
import type { ThemeNavLink } from './options';
import { stripBasePath, withBasePath } from './paths';

type SidebarEntry = SidebarEntryLike;

/**
 * Filter the full collection-built sidebar to the current docs section and
 * expose header nav links only for configured `navs`.
 */
export const onRequest = defineRouteMiddleware(async (context) => {
	context.locals.theme = themeConfig;

	const base = import.meta.env.BASE_URL;
	const pathname = stripBasePath(context.url.pathname, base);
	const fullSidebar = context.locals.starlightRoute.sidebar as SidebarEntry[];
	const navs = themeConfig.navs;

	const themeNavs: ThemeNavLink[] = navs.map((nav) => {
		if (nav.dirName) {
			// Prefer the section root (directory index or docs index) over the first page.
			return {
				label: nav.label,
				href: withBasePath(`/${nav.dirName}/`, base),
				active: isPathUnderDir(pathname, nav.dirName),
			};
		}

		const href = withBasePath(nav.href, base);
		return {
			label: nav.label,
			href,
			active: isPathAtOrUnder(pathname, stripBasePath(href, base)),
		};
	});

	context.locals.themeNavs = themeNavs;

	const sectionDir = topLevelDir(pathname);
	if (!sectionDir) return;

	const group = findSectionGroupByDir(fullSidebar, sectionDir, base);
	if (!group?.entries) return;

	const categoryEntries = await getCollection('docsCategories');
	const categories = categoryMapFromCollection(categoryEntries);
	const filtered = applyCategoryToSidebar(group.entries, sectionDir, categories);
	context.locals.starlightRoute.sidebar = filtered as typeof fullSidebar;
	context.locals.starlightRoute.pagination = sectionPagination(filtered);
});

function topLevelDir(pathname: string): string | undefined {
	const segment = pathname.replace(/^\//, '').split('/')[0];
	return segment || undefined;
}

function isPathUnderDir(pathname: string, dirName: string): boolean {
	const prefix = `/${dirName}`;
	return pathname === prefix || pathname === `${prefix}/` || pathname.startsWith(`${prefix}/`);
}

function isPathAtOrUnder(pathname: string, route: string): boolean {
	const prefix = route.replace(/\/+$/, '') || '/';
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findSectionGroupByDir(
	sidebar: SidebarEntry[],
	dirName: string,
	base: string,
): SidebarEntry | undefined {
	// Prefer a top-level group whose first link lives under dirName (collection tree).
	const byHref = sidebar.find((entry) => {
		if (entry.type !== 'group') return false;
		const href = firstLinkHref(entry);
		return href ? isPathUnderDir(stripBasePath(href, base), dirName) : false;
	});
	if (byHref) return byHref;

	// Autogenerate labels are often the raw directory name.
	return sidebar.find(
		(entry) => entry.type === 'group' && entry.label?.toLowerCase() === dirName.toLowerCase(),
	);
}

function firstLinkHref(entry: SidebarEntry): string | undefined {
	if (entry.type === 'link' && entry.href) return entry.href;
	if (entry.type === 'group' && entry.entries) {
		for (const child of entry.entries) {
			const href = firstLinkHref(child);
			if (href) return href;
		}
	}
	return undefined;
}

function flattenLinks(entries: SidebarEntry[]): SidebarEntry[] {
	return entries.flatMap((entry) =>
		entry.type === 'group' && entry.entries
			? flattenLinks(entry.entries)
			: entry.type === 'link'
				? [entry]
				: [],
	);
}

function sectionPagination(sidebar: SidebarEntry[]) {
	const links = flattenLinks(sidebar);
	const currentIndex = links.findIndex((entry) => entry.isCurrent);
	return {
		prev: currentIndex > 0 ? links[currentIndex - 1] : undefined,
		next:
			currentIndex > -1 && currentIndex < links.length - 1
				? links[currentIndex + 1]
				: undefined,
	};
}
