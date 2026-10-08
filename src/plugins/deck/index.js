const DEFAULT_IMPORT_SOURCE = 'virtual:starlight-theme-blog/deck'
const DECK_COMPONENTS = [
	'Deck',
	'DeckSlide',
	'Split',
	'SplitRight',
	'Horizontal',
	'Notes',
	'Steps',
	'Appear',
	'Head',
	'Clock',
	'Timer',
	'Zoom',
	'Invert',
	'FullScreenCode',
	'Image',
	'Embed',
]

const createImportNode = (importSource) => ({
	type: 'mdxjsEsm',
	value: `import { ${DECK_COMPONENTS.join(', ')} } from '${importSource}';`,
	data: {
		estree: {
			type: 'Program',
			sourceType: 'module',
			body: [
				{
					type: 'ImportDeclaration',
					specifiers: DECK_COMPONENTS.map((name) => ({
						type: 'ImportSpecifier',
						imported: { type: 'Identifier', name },
						local: { type: 'Identifier', name },
					})),
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

const createExpressionAttribute = (name, identifier) => ({
	type: 'mdxJsxAttribute',
	name,
	value: {
		type: 'mdxJsxAttributeValueExpression',
		value: identifier,
		data: {
			estree: {
				type: 'Program',
				sourceType: 'module',
				body: [
					{
						type: 'ExpressionStatement',
						expression: { type: 'Identifier', name: identifier },
					},
				],
			},
		},
	},
})

const createSlideNode = (children) => ({
	type: 'mdxJsxFlowElement',
	name: 'DeckSlide',
	attributes: [],
	children,
	position:
		children.length > 0
			? {
					start: children[0].position?.start,
					end: children[children.length - 1].position?.end,
				}
			: undefined,
	data: { _mdxExplicitJsx: true },
})

const hasThemeExport = (nodes) =>
	nodes.some(
		(node) =>
			node.type === 'mdxjsEsm' &&
			/^\s*export\s+(?:const|let|var)\s+theme\s*=/.test(node.value),
	)

/**
 * Transform deck MDX documents into Astro deck components.
 * @param {{ importSource?: string }} [options]
 */
export default function remarkDeck(options = {}) {
	const importSource = options.importSource ?? DEFAULT_IMPORT_SOURCE

	return (tree, file) => {
		if (file.data.astro?.frontmatter?.deck !== true) return

		const esmNodes = tree.children.filter((node) => node.type === 'mdxjsEsm')
		const contentNodes = tree.children.filter((node) => node.type !== 'mdxjsEsm')
		const slides = [[]]

		for (const node of contentNodes) {
			if (node.type === 'thematicBreak') {
				slides.push([])
			} else {
				slides[slides.length - 1].push(node)
			}
		}

		while (slides.length > 0 && slides[0].length === 0) slides.shift()
		while (slides.length > 0 && slides[slides.length - 1].length === 0) slides.pop()

		if (slides.length === 0) {
			file.fail('A deck must contain at least one non-empty slide.')
		}
		if (slides.some((slide) => slide.length === 0)) {
			file.fail('Deck slides cannot be empty; remove consecutive `---` separators.')
		}

		const attributes = []
		if (hasThemeExport(esmNodes)) {
			attributes.push(createExpressionAttribute('theme', 'theme'))
		}
		if (typeof file.data.astro.frontmatter.title === 'string') {
			attributes.push({
				type: 'mdxJsxAttribute',
				name: 'title',
				value: file.data.astro.frontmatter.title,
			})
		}

		const deckNode = {
			type: 'mdxJsxFlowElement',
			name: 'Deck',
			attributes,
			children: slides.map(createSlideNode),
			position:
				contentNodes.length > 0
					? {
							start: contentNodes[0].position?.start,
							end: contentNodes[contentNodes.length - 1].position?.end,
						}
					: undefined,
			data: { _mdxExplicitJsx: true },
		}

		tree.children.splice(0, tree.children.length, ...esmNodes, createImportNode(importSource), deckNode)
	}
}
