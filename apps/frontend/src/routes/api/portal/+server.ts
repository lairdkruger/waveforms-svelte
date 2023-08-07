import { createOrRetrieveCustomer } from 'supabase/admin'
import { stripe } from 'stripe/instance'

export const POST = async ({ url, locals: { getSession } }) => {
	try {
		const session = await getSession()
		const user = session?.user

		const customer = await createOrRetrieveCustomer({
			uuid: user?.id || '',
			email: user?.email || ''
		})

		const portalSession = await stripe.billingPortal.sessions.create({
			customer,
			return_url: `${url}/account`
		})

		return new Response(JSON.stringify({ url: portalSession.url }))
	} catch (error) {
		console.error(error)
	}

	// Return success
	return new Response()
}
