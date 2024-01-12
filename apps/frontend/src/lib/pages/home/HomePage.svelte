<script lang="ts">
	import type { Visualizer } from 'supabase'
	import VisualizerHeading from './VisualizerHeading.svelte'
	import VisualizerVideo from './VisualizerVideo.svelte'
	import { dev } from '$app/environment'

	export let visualizersData: Visualizer[]

	// Exclude primitive from product build
	const filteredVisualizersData = visualizersData.filter((visualizer) =>
		dev ? true : visualizer.slug !== 'primitive'
	)

	let activeIndex: number | null | 'coming-soon' = null
</script>

<div class="wrapper">
	<div class="list">
		{#each filteredVisualizersData as visualizer, index}
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
					slug={visualizer.slug}
					name={visualizer.name}
					description={visualizer.description}
					active={index === activeIndex}
					inactive={index !== activeIndex && activeIndex !== -1}
				/>

				{#if visualizer.mux_id}
					<VisualizerVideo muxId={visualizer.mux_id} active={index === activeIndex} />
				{/if}
			</div>
		{/each}

		<div
			class="item"
			on:pointerenter={() => {
				activeIndex = 'coming-soon'
			}}
			on:pointerleave={() => {
				activeIndex = null
			}}
		>
			<VisualizerHeading
				name="More Soon"
				description="Read about how you can support the project here"
				active={activeIndex === 'coming-soon'}
				inactive={activeIndex !== 'coming-soon' && activeIndex !== -1}
			/>
		</div>
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
