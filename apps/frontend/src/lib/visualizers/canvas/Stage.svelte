<script lang="ts">
	import { createVisualizerContext } from '../contexts/visualizer'
	import ControlPanel from '../controls/interface/ControlPanel.svelte'

	// Visualizer
	createVisualizerContext()
</script>

<slot />
<ControlPanel />
