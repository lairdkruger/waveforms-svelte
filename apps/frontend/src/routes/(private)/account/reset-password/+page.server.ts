import { fail } from '@sveltejs/kit'
import { z } from 'zod'
import { error as SvelteError } from '@sveltejs/kit'

const resetPasswordSchema = z.object({
	password: z.string(),
	token: z.string()
})

export const actions = {
	resetPassword: async ({ request, locals: { supabase, getSession } }) => {
		let actionReturn: App.FormActionReturn = { id: 'resetPassword' }

		const session = await getSession()

		if (!session) {
			throw SvelteError(401, { message: 'not authorized' })
		}

		// Construct data
		const formData = await request.formData()
		const data = {
			password: formData.get('password') as string | undefined,
			token: formData.get('token') as string | undefined
		}

		// Validate data
		const safeParse = resetPasswordSchema.safeParse(data)

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
