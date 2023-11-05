import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code')

	if (code) {
		await supabase.auth.exchangeCodeForSession(code)
	}

	const next = url.searchParams.get('next')
	if (next) {
		throw redirect(303, next)
	}

	throw redirect(303, '/')
}
