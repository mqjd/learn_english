import type { CollectionEntry } from 'astro:content';
import { DEFAULT_POSTS_DIR } from './loader';
import { withBasePath } from './paths';

export type PostEntry = CollectionEntry<'posts'>;

export function normalizePostsDir(postsDir = DEFAULT_POSTS_DIR): string {
	return postsDir.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
}

/** `flink-memory` → `/posts/flink-memory/` (with site base). */
export function postHref(id: string, base: string, postsDir = DEFAULT_POSTS_DIR): string {
	const dir = normalizePostsDir(postsDir);
	const slug = id.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
	return withBasePath(`/${dir}/${slug}/`, base);
}

export function postsIndexHref(base: string, postsDir = DEFAULT_POSTS_DIR): string {
	return withBasePath(`/${normalizePostsDir(postsDir)}/`, base);
}

export function comparePostsByDate(a: PostEntry, b: PostEntry): number {
	const ad = a.data.date?.getTime() ?? 0;
	const bd = b.data.date?.getTime() ?? 0;
	if (ad !== bd) return bd - ad;
	return a.id.localeCompare(b.id);
}

export function getPublishedPosts(posts: PostEntry[]): PostEntry[] {
	return posts.filter((post) => !post.data.draft).sort(comparePostsByDate);
}

export function getRecentPosts(posts: PostEntry[], limit = 3): PostEntry[] {
	return getPublishedPosts(posts).slice(0, limit);
}

/** Prefer frontmatter description; otherwise strip markdown and truncate. */
export function getPostExcerpt(entry: PostEntry, maxLength = 180): string {
	const description = entry.data.description?.trim();
	if (description) return description;

	const body = (entry.body ?? '')
		.replace(/^---[\s\S]*?---\s*/, '')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/!\[[^\]]*]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
		.replace(/[#>*_`~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	if (body.length <= maxLength) return body;
	return `${body.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}
