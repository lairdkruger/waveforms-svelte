import { fail } from '@sveltejs/kit'
import { z } from 'zod'

const enterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, 'Required')
})

const forgotPasswordSchema = z.object({
	email: z.string().email()
})

export const actions = {
	signin: async ({ request, locals: { supabase } }) => {
		console.log('signin')

		let actionReturn: App.FormActionReturn = { id: 'signin' }

		// Construct data
		const formData = await request.formData()
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		}

		// Validate data
		const safeParse = enterSchema.safeParse(data)

		if (!safeParse.success) {
			actionReturn = {
				...actionReturn,
				success: false,
				data: data,
				issues: safeParse.error.issues
			}
			return fail(400, actionReturn)
		}

		// Actions
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password
		})

		// Error
		if (error) {
			actionReturn = { ...actionReturn, message: error.message, success: false, data: data }
			return fail(500, actionReturn)
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Success', success: true }
		return actionReturn
	},

	signup: async ({ request, url, locals: { supabase } }) => {
		let actionReturn: App.FormActionReturn = { id: 'signup' }

		// Construct data
		const formData = await request.formData()
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		}

		// Validate data
		const safeParse = enterSchema.safeParse(data)

		if (!safeParse.success) {
			actionReturn = {
				...actionReturn,
				success: false,
				data: data,
				issues: safeParse.error.issues
			}
			return fail(400, actionReturn)
		}

		// Actions
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		})

		// Error
		if (error) {
			actionReturn = { ...actionReturn, message: error.message, success: false, data: data }
			return fail(500, actionReturn)
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Success', success: true }
		return actionReturn
	},

	forgotPassword: async ({ request, locals: { supabase } }) => {
		console.log('forgotPassword')

		let actionReturn: App.FormActionReturn = { id: 'forgotPassword' }

		// Construct data
		const formData = await request.formData()
		const data = {
			email: formData.get('email') as string
		}

		// Validate data
		const safeParse = forgotPasswordSchema.safeParse(data)

		if (!safeParse.success) {
			actionReturn = {
				...actionReturn,
				success: false,
				data: data,
				issues: safeParse.error.issues
			}
			return fail(400, actionReturn)
		}

		// Actions
		const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
			redirectTo: `${request.url}/auth/callback`
		})

		// Error
		if (error) {
			actionReturn = { ...actionReturn, message: error.message, success: false, data: data }
			return fail(500, actionReturn)
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Success', success: true }
		return actionReturn
	}
}
