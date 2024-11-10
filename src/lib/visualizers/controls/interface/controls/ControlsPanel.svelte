<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import Folder from './Folder.svelte'

	const { controls } = getVisualizerContext()
	const folders = controls.controls.folders
</script>

<div class="panel">
	<div class="list">
		{#each Object.keys(folders) as folderId}
			<Folder {folderId} />
		{/each}
	</div>
</div>

<style>
	.panel {
		position: relative;
		width: 100%;
		height: var(--cpControlsPanelHeight);

		overflow-y: scroll;
		background-color: var(--cpColorPrimary);
		border: 1px solid var(--cpColorSecondary);
	}

	.list {
		width: 100%;
		min-height: 100%;
		padding: 120px var(--cpSpacing16) 200px var(--cpSpacing24);

		display: flex;
		flex-direction: column;
		align-items: flex-end;

		overflow-y: hidden;
	}
</style>
