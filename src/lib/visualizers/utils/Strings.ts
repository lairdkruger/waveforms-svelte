export function camelcase(str: string) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/\s+/g, '')
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}
