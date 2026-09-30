import { optimize } from 'svgo'

const DEFAULT_IMPORT_SOURCE = 'virtual:starlight-theme-blog/graph'

const namedSpecifier = (name) => ({
	type: 'ImportSpecifier',
	imported: { type: 'Identifier', name },
	local: { type: 'Identifier', name },
})

export const literalAttribute = (name, value) => {
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

export const createGraphImport = (importSource = DEFAULT_IMPORT_SOURCE) => ({
	type: 'mdxjsEsm',
	value: `import { Carousel, GraphSvg } from '${importSource}';`,
	data: {
		estree: {
			type: 'Program',
			sourceType: 'module',
			body: [
				{
					type: 'ImportDeclaration',
					specifiers: [
						namedSpecifier('Carousel'),
						namedSpecifier('GraphSvg'),
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

export const toSingleNode = (content) => {
	const optimizedSvg = optimize(content, {
		multipass: true,
	})
	return {
		type: 'mdxJsxFlowElement',
		name: 'GraphSvg',
		attributes: [literalAttribute('html', optimizedSvg.data)],
		children: [],
		data: {
			_mdxExplicitJsx: true,
		},
	}
}

export const toCarouselNode = (content) => {
	const nodes = content.map(toSingleNode)
	return {
		type: 'mdxJsxFlowElement',
		name: 'Carousel',
		attributes: [],
		children: nodes,
		data: {
			_mdxExplicitJsx: true,
		},
	}
}
