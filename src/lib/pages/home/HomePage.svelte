<script lang="ts">
	import { visualizerData } from '$lib/visualizers/data'
	import VisualizerHeading from './VisualizerHeading.svelte'

	let activeIndex: number | null | 'coming-soon' = $state(null)
</script>

<div class="wrapper">
	<div class="list">
		{#each visualizerData as visualizer, index}
			<div
				class="item"
				onpointerenter={() => {
					activeIndex = index
				}}
				onpointerleave={() => {
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
			</div>
		{/each}

		<div
			class="item"
			onpointerenter={() => {
				activeIndex = 'coming-soon'
			}}
			onpointerleave={() => {
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
