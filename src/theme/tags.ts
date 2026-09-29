import type { CollectionEntry } from 'astro:content';
import { docIdToHref } from './directory-index';

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

export function getTagArchives(docs: DocsEntry[], base: string): TagArchive[] {
	const archives = new Map<string, { name: string; documents: TagDocument[] }>();

	for (const entry of docs) {
		if (entry.data.draft) continue;

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
				href: docIdToHref(entry.id, base),
			});
			archives.set(slug, archive);
		}
	}

	return [...archives.entries()]
		.map(([slug, archive]) => {
			const documents = archive.documents.sort(compareDocuments);
			return { name: archive.name, slug, count: documents.length, documents };
		})
		.sort((a, b) => compareTagNames(a.name, b.name));
}