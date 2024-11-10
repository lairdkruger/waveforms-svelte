<script lang="ts">
	import type { Snippet } from 'svelte'
	import { createVisualizerContext } from '../contexts/visualizer.svelte'
	import ControlPanel from '../controls/interface/ControlPanel.svelte'

	interface Props {
		children: Snippet
	}

	let { children }: Props = $props()

	// Visualizer
	createVisualizerContext()
</script>

{@render children()}
<ControlPanel />
<!-- <LoadUserPresets /> -->
