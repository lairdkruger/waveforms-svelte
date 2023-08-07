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

		if (!safeParse.success)
			return fail(400, { success: false, data: data, issues: safeParse.error.issues })

		// Actions
		const { error } = await supabase.auth.updateUser(data)

		if (error) {
			return fail(500, { message: error.message, success: false, data: data })
		}

		return {
			message: 'Account updated',
			success: true
		}
	}
}
