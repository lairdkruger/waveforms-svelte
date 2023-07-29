import { supabase } from '../client'
import { Json } from '../types'
import { getVisualizerBySlug } from './visualizers'

interface CreateNewPresetProps {
	name: string
	visualizerSlug: string
	userId: string
	schema: Json
}

// Insert a new preset row linked with corrosponding IDs
export const createNewPreset = async ({
	name,
	visualizerSlug,
	userId,
	schema
}: CreateNewPresetProps) => {
	const { data: visualizer } = await getVisualizerBySlug(visualizerSlug)
	if (!visualizer) throw Error('Visualizer Not Found')

	const visualizerId = visualizer.id
	if (!visualizerId) throw Error('Visualizer ID Missing')

	const { error } = await supabase
		.from('presets')
		.insert({ name: name, visualizer_id: visualizerId, user_id: userId, schema: schema })

	if (error) {
		console.error(error.message)
	}

	return { error: error ?? null }
}

interface SavePresetProps {
	id: string
	schema: Json
	midiBinding: string | null
}

// Update a preset by ID
export const savePreset = async ({ id, schema, midiBinding }: SavePresetProps) => {
	const { error } = await supabase
		.from('presets')
		.update({ schema: schema, midi_binding: midiBinding })
		.eq('id', id)

	if (error) {
		console.error(error.message)
	}

	return { error: error ?? null }
}

interface DeletePresetProps {
	id: string
}

// Delete a preset by ID
export const deletePreset = async ({ id }: DeletePresetProps) => {
	const { error } = await supabase.from('presets').delete().eq('id', id)

	if (error) {
		console.error(error.message)
	}

	return { error: error ?? null }
}
