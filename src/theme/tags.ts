import type { CollectionEntry } from 'astro:content';
import { docIdToHref } from './directory-index';
import { DEFAULT_POSTS_DIR } from './loader';
import { postHref } from './posts';

export type TagDocument = {
	id: string;
	title: string;
	date?: Date;
	href: string;
};

export type TagArchive = {
	name: string;
	slug: string;
	count: number;
	documents: TagDocument[];
};

type DocsEntry = CollectionEntry<'docs'>;
type PostsEntry = CollectionEntry<'posts'>;

type TaggedEntry = {
	id: string;
	data: { title: string; date?: Date; tags?: string[]; draft?: boolean };
};

/** Keep tag URLs consistent with the blog's kebab-case tag paths. */
export function tagSlug(name: string): string {
	return name
		.trim()
		.replace(/([a-z\d])([A-Z])/g, '$1-$2')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function compareTagNames(a: string, b: string): number {
	return a.localeCompare(b, 'en', { sensitivity: 'base' }) || a.localeCompare(b, 'en');
}

function compareDocuments(a: TagDocument, b: TagDocument): number {
	if (a.date && b.date && a.date.getTime() !== b.date.getTime()) {
		return b.date.getTime() - a.date.getTime();
	}
	if (a.date && !b.date) return -1;
	if (!a.date && b.date) return 1;
	return compareTagNames(a.title, b.title) || a.id.localeCompare(b.id);
}

function addTaggedEntry(
	archives: Map<string, { name: string; documents: TagDocument[] }>,
	entry: TaggedEntry,
	href: string,
) {
	if (entry.data.draft) return;

	const names = new Set((entry.data.tags ?? []).map((tag) => tag.trim()).filter(Boolean));
	for (const name of names) {
		const slug = tagSlug(name);
		if (!slug) continue;

		const archive = archives.get(slug) ?? { name, documents: [] };
		if (compareTagNames(name, archive.name) < 0) archive.name = name;
		archive.documents.push({
			id: entry.id,
			title: entry.data.title,
			date: entry.data.date,
			href,
		});
		archives.set(slug, archive);
	}
}

export function getTagArchives(
	docs: DocsEntry[],
	base: string,
	posts: PostsEntry[] = [],
	postsDir = DEFAULT_POSTS_DIR,
): TagArchive[] {
	const archives = new Map<string, { name: string; documents: TagDocument[] }>();

	for (const entry of docs) {
		addTaggedEntry(archives, entry, docIdToHref(entry.id, base));
	}
	for (const entry of posts) {
		addTaggedEntry(archives, entry, postHref(entry.id, base, postsDir));
	}

	return [...archives.entries()]
		.map(([slug, archive]) => {
			const documents = archive.documents.sort(compareDocuments);
			return { name: archive.name, slug, count: documents.length, documents };
		})
		.sort((a, b) => compareTagNames(a.name, b.name));
}
