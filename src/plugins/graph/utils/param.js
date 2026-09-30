const resolveValue = (value) => {
	if (value.length === 0) {
		return ''
	}

	if (value === 'null') {
		return null
	}

	if (!isNaN(value)) {
		return +value
	}

	if (value === 'true') {
		return true
	}

	if (value === 'false') {
		return false
	}
	return value
}

export const resolveParams = (text) => {
	if (!text) {
		return {}
	}
	return text
		.split(';')
		.map((v) => {
			const result = {}
			if (v.indexOf('=') !== -1) {
				result[v.substring(0, v.indexOf('='))] = resolveValue(
					v.substring(v.indexOf('=') + 1),
				)
			} else if (v) {
				result[v] = true
			}
			return result
		})
		.reduce((prev, cur) => ({ ...prev, ...cur }), {})
}

export const startWith = (text, start) => {
	return text && text.indexOf(start) === 0
}
