export const requestFullscreen = () => {
	document.documentElement
		.requestFullscreen()
		.then(() => {})
		.catch((error) => {
			console.error(error)
		})
}
