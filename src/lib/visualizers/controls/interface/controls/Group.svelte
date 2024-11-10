<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import Control from './Control.svelte'

	interface Props {
		groupId: string
		folderExpanded: boolean
	}

	let { groupId, folderExpanded }: Props = $props()

	const { controls } = getVisualizerContext()

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
