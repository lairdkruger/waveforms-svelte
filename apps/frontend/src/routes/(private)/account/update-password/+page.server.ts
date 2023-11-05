import { fail } from '@sveltejs/kit'
import { z } from 'zod'
import { error as SvelteError } from '@sveltejs/kit'

const updatePasswordSchema = z.object({
	password: z.string()
})

export const actions = {
	updatePassword: async ({ request, locals: { supabase, getSession } }) => {
		let actionReturn: App.FormActionReturn = { id: 'updatePassword' }

		// Construct data
		const formData = await request.formData()
		const data = {
			password: formData.get('password') as string | undefined
		}

		// Validate data
		const safeParse = updatePasswordSchema.safeParse(data)

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
		const { error } = await supabase.auth.updateUser({ password: data.password })

		// Error
		if (error) {
			actionReturn = {
				...actionReturn,
				message: error.message,
				success: false,
				data: data
			}
			return fail(500, actionReturn)
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Account updated', success: true }
		return actionReturn
	}
}
