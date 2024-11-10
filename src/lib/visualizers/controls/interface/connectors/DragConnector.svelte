<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { onDestroy, onMount } from 'svelte'

	let visualizerContext = getVisualizerContext()

	let dragMouseCoord = $state([0, 0])
	let initialized = $state(false)

	$effect(() => {
		if (visualizerContext.controls.controlPanelRef && !initialized) {
			visualizerContext.controls.controlPanelRef.addEventListener('mousemove', (e) =>
				controlMouseCoords(e)
			)
			initialized = true
		}
	})

	onDestroy(() => {
		visualizerContext.controls.controlPanelRef?.removeEventListener('mousemove', (e) =>
			controlMouseCoords(e)
		)
	})

	// Handle mouse move for drag events etc
	function controlMouseCoords(event: MouseEvent) {
		if (!visualizerContext.controls.controlPanelRef) return null
		if (!visualizerContext.controls.draggedSignal) return null

		const dragBounds = visualizerContext.controls.controlPanelRef.getBoundingClientRect()

		const x = event.clientX - dragBounds.left
		const y = event.clientY - dragBounds.top

		dragMouseCoord = [x, y]
	}
</script>

{#if visualizerContext.controls.draggedSignal}
	<div class="dragConnector">
		<svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polyline
				class="vertical"
				points="{visualizerContext.controls.dragStartCoord[0]}, 
						{visualizerContext.controls.dragStartCoord[1]} 
						{visualizerContext.controls.dragStartCoord[0]}, 
						{dragMouseCoord[1]}"
				fill="none"
				stroke="#000"
				stroke-width="1"
			/>
			<polyline
				class="horizontal"
				points="{visualizerContext.controls.dragStartCoord[0]}, 
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
