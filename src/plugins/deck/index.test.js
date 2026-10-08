import assert from 'node:assert/strict'
import test from 'node:test'
import remarkDeck from './index.js'

const heading = (value) => ({
	type: 'heading',
	depth: 1,
	children: [{ type: 'text', value }],
	position: { start: { line: 1, column: 1 }, end: { line: 1, column: value.length + 3 } },
})

const runPlugin = (children, frontmatter = {}) => {
	const tree = { type: 'root', children }
	const file = {
		data: { astro: { frontmatter } },
		fail(message) {
			throw new Error(message)
		},
	}
	remarkDeck()(tree, file)
	return tree
}

test('leaves non-deck documents unchanged', () => {
	const original = [heading('Article')]
	const tree = runPlugin(original)
	assert.equal(tree.children, original)
})

test('wraps slides and preserves MDX theme exports', () => {
	const themeExport = { type: 'mdxjsEsm', value: 'export const theme = customTheme;' }
	const tree = runPlugin(
		[themeExport, heading('First'), { type: 'thematicBreak' }, heading('Second')],
		{ deck: true, title: 'Example Deck' },
	)

	assert.equal(tree.children[0], themeExport)
	assert.equal(tree.children[1].type, 'mdxjsEsm')
	assert.match(tree.children[1].value, /Deck, DeckSlide/)
	const deck = tree.children[2]
	assert.equal(deck.name, 'Deck')
	assert.equal(deck.children.length, 2)
	assert.deepEqual(deck.children.map((slide) => slide.name), ['DeckSlide', 'DeckSlide'])
	assert.deepEqual(deck.attributes, [
		{
			type: 'mdxJsxAttribute',
			name: 'theme',
			value: {
				type: 'mdxJsxAttributeValueExpression',
				value: 'theme',
				data: {
					estree: {
						type: 'Program',
						sourceType: 'module',
						body: [
							{
								type: 'ExpressionStatement',
								expression: { type: 'Identifier', name: 'theme' },
							},
						],
					},
				},
			},
		},
		{ type: 'mdxJsxAttribute', name: 'title', value: 'Example Deck' },
	])
})

test('ignores empty boundary slides but rejects empty decks and gaps', () => {
	const tree = runPlugin(
		[{ type: 'thematicBreak' }, heading('Only slide'), { type: 'thematicBreak' }],
		{ deck: true },
	)
	assert.equal(tree.children.at(-1).children.length, 1)
	assert.throws(
		() => runPlugin([], { deck: true }),
		/A deck must contain at least one non-empty slide/,
	)
	assert.throws(
		() =>
			runPlugin(
				[heading('First'), { type: 'thematicBreak' }, { type: 'thematicBreak' }, heading('Last')],
				{ deck: true },
			),
		/Deck slides cannot be empty/,
	)
})