<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	const { controls, audioAnalyzer } = getVisualizerContext()

	controls.createPreset(
		'preset1',
		{
			label: 'Preset 1'
		},
		{
			// Background
			backgroundColor: {
				defaultValue: 0.0,
				gradient: [{ id: '0', coord: 0, color: [0.05, 0.05, 0.05] }]
			},

			// Persistance
			persistanceAmount: {
				defaultValue: 0,
				range: [0, 0.98],
				signal: undefined
			}
		}
	)
</script>
