<script lang="ts">
	import { createVisualizerContext } from '../contexts/visualizer'
	import ControlPanel from '../controls/interface/ControlPanel.svelte'
	import LoadUserPresets from './utils/LoadUserPresets.svelte'

	// Visualizer
	createVisualizerContext()
</script>

<slot />
<ControlPanel />
<LoadUserPresets />
