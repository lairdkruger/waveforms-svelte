import { fail } from '@sveltejs/kit'
import { ServerClient } from 'postmark'
import { z } from 'zod'

const postmarkClient = new ServerClient(process.env.POSTMARK_TOKEN!)

const contactSchema = z.object({
	name: z.string().min(1, 'Required'),
	email: z.string().email(),
	subject: z.string().min(1, 'Required'),
	message: z.string().min(1, 'Required')
})

export type ContactFormAction = Awaited<ReturnType<typeof actions.contact>>

export const actions = {
	contact: async ({ cookies, request }) => {
		// Construct data
		const formData = await request.formData()
		const data = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			subject: formData.get('subject') as string,
			message: formData.get('message') as string
		}

		// Validate data
		const safeParse = contactSchema.safeParse(data)

		if (!safeParse.success)
			return fail(400, { success: false, data: data, issues: safeParse.error.issues })

		const requestData = {
			From: String(process.env.POSTMARK_FROM_ADDRESS),
			replyTo: data.email,
			To: String(process.env.POSTMARK_TO_ADDRESS),
			Subject: data.subject!,
			TextBody: data.message
		}

		// Send email
		const emailResponse = await postmarkClient.sendEmail(requestData)
		if (emailResponse.ErrorCode) return fail(400, { success: false, data: data })

		return { success: true, data: data }
	}
}