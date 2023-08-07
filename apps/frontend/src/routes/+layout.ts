import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import type { Database } from 'supabase'

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	// Check for subscription
	// User has subscribed if a subscription record is found and its status is active
	const { data: subscriptionData, error } = await supabase
		.from('subscriptions')
		.select('user_id, status')
		.eq('user_id', session?.user.id)
		.eq('status', 'active')
		.limit(1)
		.single()

	const subscribed = subscriptionData ? true : false

	return { supabase, session, subscribed }
}
