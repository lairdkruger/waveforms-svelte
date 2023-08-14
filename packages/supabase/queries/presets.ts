// import { supabaseClient } from '../client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Json } from '../types'
import { getVisualizerBySlug } from './visualizers'

interface CreateNewPresetProps {
	supabaseClient: SupabaseClient
	name: string
	visualizerSlug: string
	userId: string
	schema: Json
}

// Insert a new preset row linked with corrosponding IDs
export const createNewPreset = async ({
	supabaseClient,
	name,
	visualizerSlug,
	userId,
	schema
}: CreateNewPresetProps) => {
	const { data: visualizer } = await getVisualizerBySlug(visualizerSlug)
	if (!visualizer) throw Error('Visualizer Not Found')

	const visualizerId = visualizer.id
	if (!visualizerId) throw Error('Visualizer ID Missing')

	const { error } = await supabaseClient
		.from('presets')
		.insert({ name: name, visualizer_id: visualizerId, user_id: userId, schema: schema })

	if (error) {
		console.error(error.message)
	}

	return { error: error ?? null }
}

interface SavePresetProps {
	supabaseClient: SupabaseClient
	id: string
	schema: Json
	midiBinding: string | null
}

// Update a preset by ID
export const savePreset = async ({ supabaseClient, id, schema, midiBinding }: SavePresetProps) => {
	const { error } = await supabaseClient
		.from('presets')
		.update({ schema: schema, midi_binding: midiBinding })
		.eq('id', id)

	if (error) {
		console.error(error.message)
	}

	return { error: error ?? null }
}

interface DeletePresetProps {
	supabaseClient: SupabaseClient
	id: string
}

// Delete a preset by ID
export const deletePreset = async ({ supabaseClient, id }: DeletePresetProps) => {
	const { error } = await supabaseClient.from('presets').delete().eq('id', id)

	if (error) {
		console.error(error.message)
	}

	return { error: error ?? null }
}
