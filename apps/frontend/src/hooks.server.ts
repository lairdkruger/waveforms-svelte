// src/hooks.server.js
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { redirect, type Handle } from '@sveltejs/kit'

const privateRoutePrefix = '/(private)'
const publicRoutePrefix = '/(public)'

export const handle = (async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	})

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession()
		return session
	}

	// Handle route protection
	if (event.route.id?.startsWith(privateRoutePrefix)) {
		const session = await event.locals.getSession()
		if (!session) {
			// the user is not signed in
			throw redirect(307, '/auth')
		}
	} else if (event.route.id?.startsWith(publicRoutePrefix)) {
		const session = await event.locals.getSession()
		if (session) {
			// the user is signed in
			throw redirect(307, '/')
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range'
		}
	})
}) satisfies Handle
