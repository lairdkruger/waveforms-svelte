import { supabase } from '../client'

// Returns array of visualizer data
export const getVisualizers = async () => {
	const { data, error } = await supabase
		.from('visualizers')
		.select()
		.order('name', { ascending: false })

	if (error) {
		console.log(error.message)
	}

	return data || []
}

// Returns array of visualizer slugs
export const getVisualizerSlugs = async () => {
	const { data, error } = await supabase.from('visualizers').select('slug')

	const slugs = data?.map((visualizer) => visualizer.slug)
	console.log(slugs)

	if (error) {
		console.log(error.message)
	}

	return slugs || []
}

// Return visualizer ID from its slug
export const getVisualizerBySlug = async (slug: string) => {
	const { data, error } = await supabase
		.from('visualizers')
		.select()
		.eq('slug', slug)
		.limit(1)
		.single()

	if (error) {
		console.log(error.message)
	}

	return { data: data ?? null, error: error ?? null }
}
