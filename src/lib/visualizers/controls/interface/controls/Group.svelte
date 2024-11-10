<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import Control from './Control.svelte'

	interface Props {
		groupId: string
		folderExpanded: boolean
	}

	let { groupId, folderExpanded }: Props = $props()

	let visualizerContext = getVisualizerContext()

	let group = visualizerContext.controls.controls.groups[groupId]
	let controlsIds = Object.keys(visualizerContext.controls.controls.controls)
	let relevantControlsIds = visualizerContext.controls.getControlsInGroup(controlsIds, group.id)
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
