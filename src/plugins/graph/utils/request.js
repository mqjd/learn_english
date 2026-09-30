export const get = async (url) => {
	return fetch(url).then((v) => v.text())
}

export const post = async ({ url, ...param }) => {
	return fetch(url, {
		method: 'POST',
		...param,
	}).then((v) => v.text())
}
