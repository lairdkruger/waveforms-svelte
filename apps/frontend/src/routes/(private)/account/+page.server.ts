import { fail } from '@sveltejs/kit'
import { z } from 'zod'

const updateUserSchema = z
	.object({
		email: z.string().email().optional(),
		password: z.string().optional()
	})
	.optional()

export const actions = {
	update: async ({ request, locals: { supabase } }) => {
		let actionReturn: App.FormActionReturn = { id: 'update' }

		// Construct data
		const formData = await request.formData()
		const data = {
			email: formData.get('email') as string | undefined,
			password: formData.get('password') as string | undefined
		}

		// Filter empty values from form as we don't want to update these
		Object.keys(data).forEach((key) => {
			// @ts-ignore
			if (data[key] == undefined || data[key] == '' || data[key] == []) {
				// @ts-ignore
				delete data[key]
			}
		})

		// Validate data
		const safeParse = updateUserSchema.safeParse(data)

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
		const { error } = await supabase.auth.updateUser(data)

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
