export const postData = async ({ url, data }: { url: string; data?: unknown }) => {
	console.log('posting,', url, data)

	try {
		const res: Response = await fetch(url, {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			console.log('Error in postData', { url, data, res })

			throw Error(res.statusText)
		}

		return res.json()
	} catch (error) {
		console.log(error)
	}
}
