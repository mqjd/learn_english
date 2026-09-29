import { visit } from 'unist-util-visit'

/** Resolved by the theme Vite plugin to `src/plugins/masonry/components`. */
const DEFAULT_IMPORT_SOURCE = 'virtual:starlight-theme-blog/masonry'

const extractTableParams = (node) => {
	if (!node || node.type !== 'mdxFlowExpression') {
		return null
	}

	const regex = /\/\*\s*([^:]+:\s*[^;]+;\s*)*([^:]+:\s*[^;]+)\s*\*\//
	const commentMatch = String(node.value ?? '').match(regex)
	if (!commentMatch) return null

	const pairs = commentMatch[0]
		.replace(/\/\*|\*\//g, '')
		.trim()
		.split(';')
	const styles = {}
	pairs.forEach((pair) => {
		const [key, value] = pair.split(':').map((s) => s.trim())
		if (key && value) {
			styles[key] = value
		}
	})
	return styles
}

const namedSpecifier = (name) => ({
	type: 'ImportSpecifier',
	imported: { type: 'Identifier', name },
	local: { type: 'Identifier', name },
})

const literalAttribute = (name, value) => {
	if (typeof value === 'string') {
		return {
			type: 'mdxJsxAttribute',
			name,
			value: {
				type: 'mdxJsxAttributeValueExpression',
				value: JSON.stringify(value),
				data: {
					estree: {
						type: 'Program',
						sourceType: 'module',
						body: [
							{
								type: 'ExpressionStatement',
								expression: {
									type: 'Literal',
									value,
									raw: JSON.stringify(value),
								},
							},
						],
					},
				},
			},
		}
	}

	return {
		type: 'mdxJsxAttribute',
		name,
		value: {
			type: 'mdxJsxAttributeValueExpression',
			value: String(value),
			data: {
				estree: {
					type: 'Program',
					sourceType: 'module',
					body: [
						{
							type: 'ExpressionStatement',
							expression: {
								type: 'Literal',
								value,
								raw: String(value),
							},
						},
					],
				},
			},
		},
	}
}

const createMasonryImport = (importSource) => ({
	type: 'mdxjsEsm',
	value: `import { GlobalMasonry, Masonry, MasonryItem } from '${importSource}';`,
	data: {
		estree: {
			type: 'Program',
			sourceType: 'module',
			body: [
				{
					type: 'ImportDeclaration',
					specifiers: [
						namedSpecifier('GlobalMasonry'),
						namedSpecifier('Masonry'),
						namedSpecifier('MasonryItem'),
					],
					source: {
						type: 'Literal',
						value: importSource,
						raw: `'${importSource}'`,
					},
				},
			],
		},
	},
})

/**
 * Remark plugin: transform masonry comment + GFM tables into Masonry MDX JSX.
 * @param {{ importSource?: string }} [options]
 */
export default function remarkMasonry(options = {}) {
	const importSource = options.importSource ?? DEFAULT_IMPORT_SOURCE
	return (tree) => {
		visit(tree, 'root', (node) => {
			const { children } = node
			let index = 0
			let hasMasonry = false
			let itemCount = 0

			do {
				const item = children[index]
				const param = extractTableParams(item)
				if (param) {
					children.splice(index, 1)
					const tableNode = children[index]
					if (param['table-style'] === 'masonry' && tableNode?.type === 'table') {
						const useStudyMode = param['study-mode'] === 'true'
						const rows = tableNode.children.slice(1)
						const extractText = (nodes = []) =>
							nodes
								.map((child) => {
									if (child.type === 'text') return child.value ?? ''
									// GFM/Starlight directives: `:name` inside IPA like [ˈkrɑ:ftsmən]
									if (child.type === 'textDirective') return `:${child.name ?? ''}`
									if (child.type === 'leafDirective') return `::${child.name ?? ''}`
									if (child.children) return extractText(child.children)
									return ''
								})
								.join('')

						const masonryItems = rows.map((row, itemIndex) => {
							if (useStudyMode) itemCount++
							const [titleCell, contentCell] = row.children
							const title =
								row.children.length === 2 ? extractText(titleCell.children) : ''
							return {
								type: 'mdxJsxFlowElement',
								name: 'MasonryItem',
								attributes: [
									literalAttribute('title', title),
									literalAttribute('index', itemCount),
									literalAttribute('key', `${index} - ${itemIndex}`),
								],
								position: row.position,
								children: contentCell?.children || titleCell?.children || [],
							}
						})
						const masonryNode = {
							type: 'mdxJsxFlowElement',
							name: 'Masonry',
							children: masonryItems,
							position: tableNode.position,
							attributes: [
								literalAttribute('itemCount', masonryItems.length),
								literalAttribute('useStudyMode', useStudyMode),
							],
						}
						children.splice(index, 1, masonryNode)
						hasMasonry = true
					}
				}
				index++
			} while (index < children.length)

			if (hasMasonry) {
				const globalMasonryNode = {
					type: 'mdxJsxFlowElement',
					name: 'GlobalMasonry',
					children: [...children],
					position: children[0]?.position,
					attributes: [
						literalAttribute('itemCount', itemCount),
						literalAttribute('useStudyMode', itemCount > 0),
					],
				}
				node.children = [createMasonryImport(importSource), globalMasonryNode]
			}
		})
	}
}
