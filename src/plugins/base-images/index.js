import { visit } from 'unist-util-visit';
import { withBasePath } from '../../theme/paths.ts';

/** Add Astro's configured base path to root-relative Markdown image URLs. */
export default function remarkBaseImages({ base = '/' } = {}) {
	return (tree) => {
		visit(tree, 'image', (node) => {
			if (node.url.startsWith('/') && !node.url.startsWith('//')) {
				node.url = withBasePath(node.url, base);
			}
		});
	};
}