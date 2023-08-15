import { fail } from '@sveltejs/kit'
import { createNewPreset, deletePreset, savePreset } from 'supabase'
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
const presetCreationSchema = z.object({
	name: z.string(),
	visualizerSlug: z.string(),
	controlsSchema: z.string()
})

const presetDeleterSchema = z.object({
	presetId: z.string()
})

const presetSaverSchema = z.object({
	presetId: z.string(),
	controlsSchema: z.string(),
	presetMidiBinding: z.string()
})

export const actions = {
	presetCreator: async ({ request, locals: { supabase, getSession } }) => {
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
		const { error } = await createNewPreset({
			supabaseClient: supabase,
			name: data.name,
			visualizerSlug: data.visualizerSlug,
			userId: userId,
			schema: data.controlsSchema
		})

		// Action errors
		if (error) {
			console.error(error)
			actionReturn = { ...actionReturn, success: false, data: data, message: error.message }
			return fail(500, { message: error.message, success: false, data: data })
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Preset Created', success: true, data: data }
		return actionReturn
	},

	// Preset Deleter
	presetDeleter: async ({ request, locals: { supabase } }) => {
		let actionReturn: App.FormActionReturn = { id: 'presetDeleter' }

		// Construct data
		const formData = await request.formData()
		const data = {
			presetId: formData.get('presetId') as string
		}

		// Data validation
		const safeParse = presetDeleterSchema.safeParse(data)

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
		const { error } = await deletePreset({
			supabaseClient: supabase,
			id: data.presetId
		})

		// Action errors
		if (error) {
			console.error(error)
			actionReturn = { ...actionReturn, success: false, data: data, message: error.message }
			return fail(500, { message: error.message, success: false, data: data })
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Preset Deleted', success: true, data: data }
		return actionReturn
	},

	// Preset Saver
	// Preset Deleter
	presetSaver: async ({ request, locals: { supabase } }) => {
		let actionReturn: App.FormActionReturn = { id: 'presetSaver' }

		// Construct data
		const formData = await request.formData()
		const data = {
			presetId: formData.get('presetId') as string,
			controlsSchema: formData.get('controlsSchema') as string,
			presetMidiBinding: formData.get('presetMidiBinding') as string
		}

		// Data validation
		const safeParse = presetSaverSchema.safeParse(data)

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
		const { error } = await savePreset({
			supabaseClient: supabase,
			id: data.presetId,
			schema: data.controlsSchema,
			midiBinding: data.presetMidiBinding
		})

		// Action errors
		if (error) {
			console.error(error)
			actionReturn = { ...actionReturn, success: false, data: data, message: error.message }
			return fail(500, { message: error.message, success: false, data: data })
		}

		// Success
		actionReturn = { ...actionReturn, message: 'Preset Saved', success: true, data: data }
		return actionReturn
	}
}
