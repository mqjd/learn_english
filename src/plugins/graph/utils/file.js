import fs from 'node:fs/promises'

const readFile = async (filePath) => {
	return fs.readFile(filePath, 'utf-8')
}

const isFileExists = async (filePath) => {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}

export const readFileIfExists = async (filePath) => {
	const exists = await isFileExists(filePath)
	if (exists) {
		return readFile(filePath)
	}
	return null
}
