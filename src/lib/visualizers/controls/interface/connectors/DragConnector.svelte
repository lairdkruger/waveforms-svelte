<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { onDestroy, onMount } from 'svelte'

	const { controls } = getVisualizerContext()
	const controlPanelRef = controls.controlPanelRef
	const draggedSignal = controls.draggedSignal
	const dragStartCoord = controls.dragStartCoord

	let dragMouseCoord = $state([0, 0])
	let initialized = $state(false)

	onMount(() => {
		if (controlPanelRef && !initialized) {
			controlPanelRef.addEventListener('mousemove', (e) => controlMouseCoords(e))
			initialized = true
		}
	})

	onDestroy(() => {
		controlPanelRef?.removeEventListener('mousemove', (e) => controlMouseCoords(e))
	})

	// Handle mouse move for drag events etc
	function controlMouseCoords(event: MouseEvent) {
		if (!controlPanelRef) return null
		if (!draggedSignal) return null

		const dragBounds = controlPanelRef.getBoundingClientRect()

		const x = event.clientX - dragBounds.left
		const y = event.clientY - dragBounds.top

		dragMouseCoord = [x, y]
	}
</script>

{#if draggedSignal}
	<div class="dragConnector">
		<svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polyline
				class="vertical"
				points="{dragStartCoord[0]}, 
						{dragStartCoord[1]} 
						{dragStartCoord[0]}, 
						{dragMouseCoord[1]}"
				fill="none"
				stroke="#000"
				stroke-width="1"
			/>
			<polyline
				class="horizontal"
				points="{dragStartCoord[0]}, 
						{dragMouseCoord[1]} 
						{dragMouseCoord[0]}, 
						{dragMouseCoord[1]}"
				fill="none"
				stroke="#000"
				stroke-width="1"
			/>
		</svg>
	</div>
{/if}

<style>
	.dragConnector {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}
</style>
