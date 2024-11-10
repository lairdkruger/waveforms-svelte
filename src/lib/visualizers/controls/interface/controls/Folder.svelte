<script lang="ts">
	import ExpandIcon from '$lib/svgs/ExpandIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { slide } from 'svelte/transition'
	import Group from './Group.svelte'

	export let folderId: string

	const { controls } = getVisualizerContext()
	const folder = controls.controls.folders[folderId]
	const groups = controls.controls.groups
	const relevantGroups = Object.entries(groups).filter(([, group]) => group.folder === folder.id)

	// Only expand the first folder by default
	let expanded = folder.id === Object.keys(controls.controls.folders)[0]
</script>

<div class="folder">
	<button class="head" on:click={() => (expanded = !expanded)}>
		<div class="label">
			<h3 class="cpHeading">{folder.label}</h3>
		</div>
		<div class="expand">
			<div class="folderExpandIcon">
				<ExpandIcon active={expanded} />
			</div>
			<div class="lineHorizontal" />
			<div class="lineVertical" />
		</div>
	</button>
	<div class="accordion">
		{#if expanded}
			<div class="content" transition:slide>
				{#each relevantGroups as [groupId, _]}
					<Group {groupId} folderExpanded={expanded} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.folder {
		position: relative;

		width: 100%;
		margin-bottom: var(--cpSpacing8);

		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.head {
		width: var(--cpFolderWidth);

		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.label {
		flex-shrink: 0;
	}

	.expand {
		padding-left: var(--cpSpacing8);
		display: flex;
		align-items: center;
		width: 100%;
	}

	.folderExpandIcon {
		display: flex;
	}

	.lineHorizontal {
		height: 1px;
		width: 100%;
		background-color: var(--cpColorSecondary);
	}

	.lineVertical {
		height: 100%;
		width: 1px;
		background-color: var(--cpColorSecondary);
		position: absolute;
		right: 0;
		transform: translateY(50%);
	}

	.content {
		padding-top: var(--cpSpacing8);
		padding-bottom: var(--cpSpacing24);

		display: flex;
		flex-direction: column;
		align-items: flex-end;
		row-gap: 8px;
	}
</style>
