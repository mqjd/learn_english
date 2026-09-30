import drawioParser from './drawio.js'
import { toCarouselNode, toSingleNode } from '../../utils/index.js'

const toNode = (content) => {
	if (Array.isArray(content)) {
		if (content.length === 1) {
			return toSingleNode(content[0])
		}
		return toCarouselNode(content)
	}
	return toSingleNode(content)
}

const parser = async (param) => {
	const parsedResult = await drawioParser(param)
	return toNode(parsedResult)
}

export default parser
