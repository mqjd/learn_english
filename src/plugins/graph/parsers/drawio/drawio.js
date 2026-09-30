import path from 'node:path'
import { readFileIfExists } from '../../utils/index.js'
import DrawioRender from './render.js'

const render = new DrawioRender()
const cache = {}
let initialized = false
const useCache = process.env.NODE_ENV === 'production'

process.once('SIGINT', async () => {
	await render.close()
})

const drawioParser = async (param) => {
	const {
		content,
		pluginOptions: { basePath, remoteBasePath, mxgraphPath },
		nodeOptions,
	} = param

	if (!initialized) {
		await render.init(mxgraphPath)
		initialized = true
	}

	const trimmed = content.trim()
	const cacheKey = trimmed + String(nodeOptions.page)
	if (useCache && cache[cacheKey]) {
		return cache[cacheKey]
	}

	console.log(`render ${trimmed} page: ${nodeOptions.page ?? 'all'} start`)

	const localPath = path.join(basePath, trimmed)
	let drawioContent = await readFileIfExists(localPath)
	if (drawioContent === null) {
		if (trimmed.indexOf('http') !== 0) {
			if (!trimmed.startsWith('<')) {
				throw new Error(`Drawio file not found: ${localPath}`)
			}
			drawioContent = trimmed
		} else {
			drawioContent = (remoteBasePath || '') + trimmed
		}
	}

	const svg = await render.renderSvgs(drawioContent, nodeOptions.page)
	if (useCache) {
		cache[cacheKey] = svg
	}
	console.log(`render ${trimmed} page: ${nodeOptions.page ?? 'all'} end`)
	return svg
}

export default drawioParser
