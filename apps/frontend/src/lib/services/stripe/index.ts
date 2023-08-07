import { goto } from '$app/navigation'

export async function handleCustomerPortal() {
	const fetchPortal = await fetch('/api/portal', {
		method: 'POST',
		credentials: 'same-origin'
	})

	const { url: portalUrl } = await fetchPortal.json()
	goto(portalUrl)
}

export async function handleCheckout() {
	const fetchCheckout = await fetch('/api/checkout', {
		method: 'POST',
		credentials: 'same-origin'
	})

	const { url: checkoutUrl } = await fetchCheckout.json()
	goto(checkoutUrl)
}
