import { POSTMARK_FROM_ADDRESS, POSTMARK_TOKEN, POSTMARK_TO_ADDRESS } from '$env/static/private'
import { fail } from '@sveltejs/kit'
import { ServerClient } from 'postmark'
import { z } from 'zod'

const postmarkClient = new ServerClient(POSTMARK_TOKEN)

const contactSchema = z.object({
	name: z.string().min(1, 'Required'),
	email: z.string().email(),
	subject: z.string().min(1, 'Required'),
	message: z.string().min(1, 'Required')
})

export const actions = {
	contact: async ({ request }) => {
		// Construct data
		const formData = await request.formData()
		const data = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			subject: formData.get('subject') as string,
			message: formData.get('message') as string
		}

		// Validation
		const safeParse = contactSchema.safeParse(data)

		if (!safeParse.success)
			return fail(400, { success: false, data: data, issues: safeParse.error.issues })

		// Actions
		const requestData = {
			From: String(POSTMARK_FROM_ADDRESS),
			replyTo: data.email,
			To: String(POSTMARK_TO_ADDRESS),
			Subject: data.subject!,
			TextBody: data.message
		}

		// Send email
		const emailResponse = await postmarkClient.sendEmail(requestData)
		if (emailResponse.ErrorCode) return fail(400, { success: false, data: data })

		return { success: true, data: data }
	}
}
