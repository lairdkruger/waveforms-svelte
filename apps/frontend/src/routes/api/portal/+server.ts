import { createOrRetrieveCustomer } from 'supabase/admin'
import { stripe } from 'stripe/instance'
import type { RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'

export const POST: RequestHandler = async ({ url, locals: { getSession } }) => {
	try {
		const session = await getSession()
		const user = session?.user

		const customer = await createOrRetrieveCustomer({
			uuid: user?.id || '',
			email: user?.email || ''
		})

		const portalSession = await stripe.billingPortal.sessions.create({
			customer,
			return_url: `${env.PUBLIC_SITE_URL}/account`
		})

		return new Response(JSON.stringify({ url: portalSession.url }))
	} catch (error) {
		console.error(error)
	}

	// Return success
	return new Response()
}
