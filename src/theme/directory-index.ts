import fs from 'node:fs';
import path from 'node:path';

const DOC_INDEX_RE = /^index\.(md|mdx|mdoc|markdown|mdown|mkdn|mkd|mdwn)$/i;
const DOC_FILE_RE = /\.(md|mdx|mdoc|markdown|mdown|mkdn|mkd|mdwn)$/i;

export type DirectoryChild = {
	type: 'page' | 'dir';
	label: string;
	href: string;
	/** Sort weight from `_category_.json`; unset → directory / id order. */
	position?: number;
};

export type CategoryMeta = {
	label?: string;
	position?: number;
};

/** Map of docs-relative directory id → category meta (`peppa-pig/s1` → { label, position }). */
export type CategoryMap = Map<string, CategoryMeta>;

type DocLike = {
	id: string;
	data: { title?: string };
};

type CategoryLike = {
	id: string;
	data: CategoryMeta;
};

type SortableChild = DirectoryChild & { name: string };

/** Collection id → URL path (`medias/the-intern` → `/medias/the-intern/`). */
export function docIdToHref(id: string): string {
	let slug = id.replace(/\\/g, '/');
	if (slug.endsWith('/index')) slug = slug.slice(0, -'/index'.length);
	else if (slug === 'index') slug = '';
	return slug ? `/${slug}/` : '/';
}

/** `peppa-pig` → `Peppa Pig`; `s1-e01-e10` → `S1 E01 E10`. */
export function humanizeSegment(segment: string): string {
	return segment
		.split(/[-_]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

/** Build a lookup map from the `docsCategories` collection. */
export function categoryMapFromCollection(categories: CategoryLike[]): CategoryMap {
	const map: CategoryMap = new Map();
	for (const entry of categories) {
		const id = entry.id
			.replace(/\\/g, '/')
			.replace(/\/_category_\.json$/i, '')
			.replace(/\/_category$/i, '');
		const meta: CategoryMeta = {};
		if (typeof entry.data.label === 'string' && entry.data.label.trim()) {
			meta.label = entry.data.label.trim();
		}
		if (typeof entry.data.position === 'number' && Number.isFinite(entry.data.position)) {
			meta.position = entry.data.position;
		}
		if (meta.label != null || meta.position != null) map.set(id, meta);
	}
	return map;
}

export function getCategoryMeta(categories: CategoryMap, dirId: string): CategoryMeta {
	return categories.get(dirId.replace(/\\/g, '/')) ?? {};
}

/** Label for a directory: `_category_.json` → navs (top-level) → raw folder name. */
export function titleForDirectory(
	dirId: string,
	navs: { label: string; dirName: string }[] = [],
	categories: CategoryMap = new Map(),
): string {
	const categoryLabel = getCategoryMeta(categories, dirId).label;
	if (categoryLabel) return categoryLabel;

	const segments = dirId.split('/').filter(Boolean);
	const top = segments[0];
	if (segments.length === 1) {
		const nav = navs.find((item) => item.dirName === top);
		if (nav) return nav.label;
	}
	return segments[segments.length - 1] ?? dirId;
}

/**
 * Relative directory paths under `docsDir` that have content but no index
 * page (e.g. `medias`, `peppa-pig`). Root `docs/` itself is never included.
 *
 * Used at `astro:config:setup` for `injectRoute` (collections are not available yet).
 */
export function findDirsNeedingIndex(docsDir: string, projectRoot: string): string[] {
	const absRoot = path.resolve(projectRoot, docsDir);
	if (!fs.existsSync(absRoot)) return [];

	const result: string[] = [];

	function walk(rel: string): boolean {
		const absDir = rel ? path.join(absRoot, rel) : absRoot;
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(absDir, { withFileTypes: true });
		} catch {
			return false;
		}

		const hasIndex = entries.some((entry) => entry.isFile() && DOC_INDEX_RE.test(entry.name));
		let hasContent = false;

		for (const entry of entries) {
			if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

			if (entry.isDirectory()) {
				const childRel = rel ? `${rel}/${entry.name}` : entry.name;
				if (walk(childRel.replace(/\\/g, '/'))) hasContent = true;
			} else if (entry.isFile() && DOC_FILE_RE.test(entry.name) && !DOC_INDEX_RE.test(entry.name)) {
				hasContent = true;
			}
		}

		if (rel && hasContent && !hasIndex) {
			result.push(rel.replace(/\\/g, '/'));
		}

		return hasContent || hasIndex;
	}

	walk('');
	return result.sort((a, b) => a.localeCompare(b));
}

/**
 * Immediate children of a docs directory: pages and subdirectories that
 * contain further docs.
 *
 * Directory labels/positions come from the `docsCategories` collection when
 * present; otherwise the folder name and id order are used.
 */
export function getDirectoryChildren(
	dirId: string,
	docs: DocLike[],
	categories: CategoryMap = new Map(),
): DirectoryChild[] {
	const prefix = dirId ? `${dirId}/` : '';
	const pages: SortableChild[] = [];
	const subdirMeta = new Map<string, { hasIndex: boolean; indexTitle?: string }>();

	for (const entry of docs) {
		const id = entry.id.replace(/\\/g, '/');
		if (dirId) {
			if (id === dirId || id === `${dirId}/index`) continue;
			if (!id.startsWith(prefix)) continue;
		} else if (!id.includes('/')) {
			continue;
		}

		const rest = dirId ? id.slice(prefix.length) : id;
		const segments = rest.split('/').filter(Boolean);
		if (segments.length === 0) continue;

		if (segments.length === 1) {
			pages.push({
				type: 'page',
				name: segments[0],
				label: entry.data.title ?? segments[0],
				href: docIdToHref(id),
			});
			continue;
		}

		const subdir = segments[0];
		const meta = subdirMeta.get(subdir) ?? { hasIndex: false };
		if (segments.length === 2 && segments[1] === 'index') {
			meta.hasIndex = true;
			meta.indexTitle = entry.data.title;
		}
		subdirMeta.set(subdir, meta);
	}

	const dirs: SortableChild[] = [];

	for (const [name, meta] of subdirMeta) {
		const childId = dirId ? `${dirId}/${name}` : name;
		const category = getCategoryMeta(categories, childId);

		if (meta.hasIndex) {
			pages.push({
				type: 'page',
				name,
				label: meta.indexTitle ?? category.label ?? name,
				href: docIdToHref(`${childId}/index`),
				position: category.position,
			});
		} else {
			dirs.push({
				type: 'dir',
				name,
				label: category.label ?? name,
				href: `/${childId}/`,
				position: category.position,
			});
		}
	}

	const compare = (a: SortableChild, b: SortableChild): number => {
		const posA = a.position ?? Number.POSITIVE_INFINITY;
		const posB = b.position ?? Number.POSITIVE_INFINITY;
		if (posA !== posB) return posA - posB;
		return a.name.localeCompare(b.name);
	};

	return [...dirs, ...pages].sort(compare).map(({ type, label, href, position }) => {
		const child: DirectoryChild = { type, label, href };
		if (position != null) child.position = position;
		return child;
	});
}

/**
 * Apply `_category_.json` labels (and sibling sort by `position`) to
 * autogenerated sidebar groups. Group `label` is the raw directory name
 * before this runs.
 */
export function applyCategoryToSidebar(
	entries: SidebarEntryLike[],
	parentDirId: string,
	categories: CategoryMap,
): SidebarEntryLike[] {
	const enriched = entries.map((entry, index) => {
		if (entry.type !== 'group' || !entry.entries) {
			return { entry, position: undefined as number | undefined, index };
		}

		const dirName = entry.label ?? '';
		const dirId = parentDirId ? `${parentDirId}/${dirName}` : dirName;
		const category = getCategoryMeta(categories, dirId);
		const next: SidebarEntryLike = {
			...entry,
			label: category.label ?? dirName,
			entries: applyCategoryToSidebar(entry.entries, dirId, categories),
		};
		return { entry: next, position: category.position, index };
	});

	enriched.sort((a, b) => {
		const posA = a.position ?? Number.POSITIVE_INFINITY;
		const posB = b.position ?? Number.POSITIVE_INFINITY;
		if (posA !== posB) return posA - posB;
		// Unpositioned: keep original sibling order (collection order).
		return a.index - b.index;
	});

	return enriched.map(({ entry }) => entry);
}

export type SidebarEntryLike = {
	type: string;
	label?: string;
	href?: string;
	isCurrent?: boolean;
	entries?: SidebarEntryLike[];
};
