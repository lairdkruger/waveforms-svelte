import { fail } from '@sveltejs/kit'
import { createNewPreset } from 'supabase'
import { z } from 'zod'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import { getVisualizerBySlug, type Database } from 'supabase'

export const load = async ({ params, fetch, locals: { getSession } }) => {
	const session = await getSession()

	const supabase = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: session
	})

	const slug = params.slug

	const { data: visualizer } = await getVisualizerBySlug(slug)
	const visualizerId = visualizer?.id

	const { data: user } = await supabase.auth.getUser()
	const userId = user.user?.id

	const { data: userPresets } = await supabase
		.from('presets')
		.select()
		.eq('user_id', userId)
		.eq('visualizer_id', visualizerId)

	return { visualizerSlug: slug, userPresets }
}

// Actions
// Preset Creation
const presetCreationSchema = z.object({
	name: z.string(),
	visualizerSlug: z.string(),
	controlsSchema: z.string()
})

export const actions = {
	presetCreator: async ({ request, locals: { getSession } }) => {
		let actionReturn: App.FormActionReturn = { id: 'presetCreator' }

		const session = await getSession()
		const userId = session?.user?.id

		// Construct data
		const formData = await request.formData()
		const data = {
			name: formData.get('name') as string,
			visualizerSlug: formData.get('visualizerSlug') as string,
			controlsSchema: formData.get('controlsSchema') as string
		}

		// Data validation
		const safeParse = presetCreationSchema.safeParse(data)

		if (!safeParse.success) {
			actionReturn = {
				...actionReturn,
				success: false,
				data: data,
				issues: safeParse.error.issues
			}
			return fail(400, actionReturn)
		}

		if (!userId) {
			actionReturn = { ...actionReturn, success: false, data: data }
			return fail(400, actionReturn)
		}

		// Actions
		// const { error } = await createNewPreset({
		// 	name: data.name,
		// 	visualizerSlug: data.visualizerSlug,
		// 	userId: userId,
		// 	schema: data.controlsSchema
		// })

		// Action errors
		// if (error) {
		// 	actionReturn = { ...actionReturn, success: false, data: data, message: error.message }
		// 	return fail(500, { message: error.message, success: false, data: data })
		// }

		// Success
		actionReturn = { ...actionReturn, message: 'Preset Created', success: true, data: data }
		return actionReturn
	}
}
