import drawioParser from './drawio/index.js'
import krokiParser from './kroki/index.js'

const parsers = {
	drawio: drawioParser,
	default: krokiParser,
}

const parser = async (param) => {
	const { nodeOptions } = param
	return (parsers[nodeOptions.lang] || parsers.default)(param)
}

export default parser
