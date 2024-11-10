<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import Control from './Control.svelte'

	export let groupId: string
	export let folderExpanded: boolean

	const { controls } = getVisualizerContext()
	$: preset = controls.presets.preset

	const group = controls.controls.groups[groupId]
	const controlsIds = Object.keys(controls.controls.controls)
	const relevantControlsIds = controls.getControlsInGroup(controlsIds, group.id)
</script>

<div class="group">
	{#each relevantControlsIds as controlId}
		<Control {controlId} {folderExpanded} />
	{/each}
</div>

<style>
	.group {
		width: var(--cpControlWidth);

		display: flex;
		flex-direction: column;
		row-gap: var(--cpSpacing8);
	}
</style>
