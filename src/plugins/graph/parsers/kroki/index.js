import path from 'node:path'
import { post, get, toSingleNode, readFileIfExists } from '../../utils/index.js'

const parser = async (param) => {
	const {
		content,
		pluginOptions: { basePath, remoteBasePath, krokiUrl },
		nodeOptions: { lang },
	} = param

	const trimmed = content.trim()
	const localPath = path.join(basePath, trimmed)
	let fileContent = await readFileIfExists(localPath)
	if (fileContent === null) {
		if (trimmed.indexOf('http') === 0) {
			fileContent = await get(trimmed)
		} else if (/\n/.test(trimmed)) {
			fileContent = trimmed
		} else {
			try {
				fileContent = await get((remoteBasePath || '') + trimmed)
			} catch {
				throw new Error('invalid content ' + trimmed)
			}
		}
	}

	const result = await post({
		url: krokiUrl,
		headers: {
			'Content-Type': 'text/plain',
		},
		body: JSON.stringify({
			diagram_source: fileContent,
			diagram_type: lang,
			output_format: 'svg',
		}),
	})
	return toSingleNode(result)
}

export default parser
