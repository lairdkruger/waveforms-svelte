import { fail } from '@sveltejs/kit'
import { z } from 'zod'

const enterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, 'Required')
})

export const actions = {
	signin: async ({ request, locals: { supabase } }) => {
		// Construct data
		const formData = await request.formData()
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		}

		// Validate data
		const safeParse = enterSchema.safeParse(data)

		if (!safeParse.success)
			return fail(400, { success: false, data: data, issues: safeParse.error.issues })

		// Actions
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password
		})

		if (error) {
			return fail(500, { message: error.message, success: false, data: data })
		}

		return {
			message: 'Success',
			success: true
		}
	},
	signup: async ({ request, url, locals: { supabase } }) => {
		// Construct data
		const formData = await request.formData()
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		}

		// Validate data
		const safeParse = enterSchema.safeParse(data)

		if (!safeParse.success)
			return fail(400, { success: false, data: data, issues: safeParse.error.issues })

		// Actions
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		})

		if (error) {
			return fail(500, { message: error.message, success: false, data: data })
		}

		return {
			message: 'Success',
			success: true
		}
	}
}
