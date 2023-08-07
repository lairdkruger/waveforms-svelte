import { createOrRetrieveCustomer } from 'supabase/admin'
import { stripe } from 'stripe/instance'
import { redirect } from '@sveltejs/kit'

export const POST = async ({ url, locals: { getSession } }) => {
	try {
		const session = await getSession()
		const user = session?.user

		const customer = await createOrRetrieveCustomer({
			uuid: user?.id || '',
			email: user?.email || ''
		})

		const checkoutSession = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			billing_address_collection: 'required',
			customer,
			line_items: [
				{
					price: 'price_1NFRt5Lb5wHPhvu3vHIGvMq7',
					quantity: 1
				}
			],
			mode: 'subscription',
			allow_promotion_codes: true,
			subscription_data: {
				trial_from_plan: true
			},
			success_url: `${url.origin}/account`,
			cancel_url: `${url.origin}/account`
		})

		if (checkoutSession.url) return new Response(JSON.stringify({ url: checkoutSession.url }))
	} catch (error) {
		console.error(error)
	}

	// Return success
	return new Response()
}
