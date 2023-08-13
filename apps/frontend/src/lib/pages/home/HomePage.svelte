<script lang="ts">
	import type { Visualizer } from 'supabase'
	import VisualizerHeading from './VisualizerHeading.svelte'
	import VisualizerVideo from './VisualizerVideo.svelte'

	export let visualizersData: Visualizer[]

	let activeIndex: number | null = null
</script>

<div class="wrapper">
	<div class="list">
		{#each visualizersData as visualizer, index}
			<div
				class="item"
				on:pointerenter={() => {
					activeIndex = index
				}}
				on:pointerleave={() => {
					activeIndex = null
				}}
			>
				<VisualizerHeading
					{visualizer}
					active={index === activeIndex}
					inactive={index !== activeIndex && activeIndex !== -1}
				/>

				{#if visualizer.mux_id}
					<VisualizerVideo muxId={visualizer.mux_id} active={index === activeIndex} />
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.wrapper {
		padding: var(--margin);
	}

	.list {
		padding-top: var(--row);
		padding-right: var(--column);
	}

	@media (max-width: 768px) {
		.list {
			padding-right: 0;
		}
	}

	.item {
		position: relative;
		overflow: hidden;
		margin-bottom: calc(var(--largeHeadingSize) / 1.5);
		display: flex;
		justify-content: flex-end;
	}
</style>
