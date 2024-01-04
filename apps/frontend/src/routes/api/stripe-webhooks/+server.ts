import {
	manageSubscriptionStatusChange,
	upsertPriceRecord,
	upsertProductRecord
} from 'supabase/admin'
import { stripe } from 'stripe/instance'
import type { RequestHandler } from '@sveltejs/kit'
import type Stripe from 'stripe'
import { env } from '$env/dynamic/private'

const relevantEvents = new Set([
	'product.created',
	'product.updated',
	'price.created',
	'price.updated',
	'checkout.session.completed',
	'customer.subscription.created',
	'customer.subscription.updated',
	'customer.subscription.deleted'
])

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.text()
		const signature = request.headers.get('stripe-signature') || ''
		const webhookSecret = env.STRIPE_WEBHOOK_SECRET as string
		let event: Stripe.Event

		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
		} catch (err: any) {
			console.log(`❌ Error message: ${err.message}`)
			return new Response(`Webhook Error: ${err.message}`, { status: 400 })
		}

		console.log('got to here:', event.data.object)

		if (relevantEvents.has(event.type)) {
			try {
				switch (event.type) {
					case 'product.created':
					case 'product.updated':
						await upsertProductRecord(event.data.object as Stripe.Product)
						break
					case 'price.created':
					case 'price.updated':
						await upsertPriceRecord(event.data.object as Stripe.Price)
						break
					case 'customer.subscription.created':
					case 'customer.subscription.updated':
					case 'customer.subscription.deleted': {
						const subscription = event.data.object as Stripe.Subscription
						await manageSubscriptionStatusChange(
							subscription.id,
							subscription.customer as string,
							event.type === 'customer.subscription.created'
						)
						break
					}

					case 'checkout.session.completed': {
						const checkoutSession = event.data.object as Stripe.Checkout.Session
						if (checkoutSession.mode === 'subscription') {
							const subscriptionId = checkoutSession.subscription
							await manageSubscriptionStatusChange(
								subscriptionId as string,
								checkoutSession.customer as string,
								true
							)
						}
						break
					}
					default:
						throw new Error('Unhandled relevant event!')
				}
			} catch (error) {
				console.log(error)
				return new Response('Webhook error: "Webhook handler failed. View logs."', {
					status: 400
				})
			}
		}

		return new Response(JSON.stringify({ received: true }))
	} catch (error) {
		console.error(error)
	}

	// Return success
	return new Response()
}
