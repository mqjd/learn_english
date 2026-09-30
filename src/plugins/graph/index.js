import { visit } from 'unist-util-visit'
import { resolveParams, startWith, createGraphImport } from './utils/index.js'
import parser from './parsers/index.js'

const prefix = 'graph'
const prefixLength = prefix.length + 1
const DEFAULT_IMPORT_SOURCE = 'virtual:starlight-theme-blog/graph'

/**
 * Remark plugin: transform ```graph fences into GraphSvg / Carousel MDX JSX.
 * @param {{
 *   basePath?: string
 *   mxgraphPath?: string
 *   krokiUrl?: string
 *   remoteBasePath?: string
 *   importSource?: string
 * }} [options]
 */
export default function remarkGraph(options = {}) {
	const importSource = options.importSource ?? DEFAULT_IMPORT_SOURCE
	const pluginOptions = options

	return async (tree) => {
		const graphNodes = []
		visit(tree, 'code', (node) => {
			const lang = (node.lang || '').trim()
			if (startWith(lang, prefix)) {
				graphNodes.push({
					node,
					options: resolveParams(lang.substring(prefixLength)),
				})
			}
		})

		if (graphNodes.length === 0) {
			return
		}

		await Promise.all(
			graphNodes.map(async ({ node, options: nodeOptions }) => {
				try {
					const resultNode = await parser({
						content: node.value,
						nodeOptions,
						pluginOptions,
					})
					node.type = resultNode.type
					node.name = resultNode.name
					node.children = resultNode.children
					node.attributes = resultNode.attributes
					node.data = resultNode.data
					delete node.value
					delete node.lang
					delete node.meta
				} catch (e) {
					console.error(`plugin: graph, error when parse ${node.value}`, e)
					node.type = 'html'
					node.value = `<span>${e}</span>`
					delete node.lang
					delete node.meta
				}
			}),
		)

		const hasGraph = graphNodes.some(
			({ node }) =>
				node.type === 'mdxJsxFlowElement' &&
				(node.name === 'Carousel' || node.name === 'GraphSvg'),
		)
		if (hasGraph) {
			tree.children.unshift(createGraphImport(importSource))
		}
	}
}
