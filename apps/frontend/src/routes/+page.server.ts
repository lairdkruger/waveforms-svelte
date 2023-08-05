import { getVisualizers } from 'supabase'

export const load = async () => {
	return {
		visualizers: await getVisualizers()
	}
}
