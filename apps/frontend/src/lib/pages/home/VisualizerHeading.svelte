<script lang="ts">
	import ArrowIcon from '$lib/svgs/ArrowIcon.svelte'
	import type { Visualizer } from 'supabase'

	export let visualizer: Visualizer
	export let active: boolean
	export let inactive: boolean

	let width = 12
</script>

<a href="/visualizers/test">
	<div
		class="wrapper"
		style="
		transform: translateX({active ? -width - 10 : 0}px);
		color: active ? '#ffffff' : '#000000';
		mixBlendMode: active ? 'difference' : 'normal'
	"
	>
		<div class="arrowWrapper">
			<div class="arrow">
				<ArrowIcon />
			</div>
		</div>

		<div class="headingWrapper">
			<h2 class="heading" style="opacity: {inactive ? 0 : 1}">
				{visualizer.name}
			</h2>
			<h2 class="heading outlined" style=" opacity: {inactive ? 1 : 0} ">
				{visualizer.name}
			</h2>
		</div>

		<div class="info">
			<h3 class="infoHeading">Realtime Audio Visualizer</h3>
			<p>{visualizer.description}</p>
		</div>
	</div>
</a>

<style>
	.wrapper {
		cursor: pointer;
		display: flex;
		flex-direction: row-reverse;
		margin-bottom: 0;
		color: var(--black);
	}

	.arrowWrapper {
		position: absolute;
		top: 0;
		right: 0;
	}

	.arrow {
		position: relative;
		right: -100%;
		height: 100%;
		width: calc(var(--largeHeadingSize) + 20px);
		padding-left: 20px;
	}

	.headingWrapper {
		position: relative;
		margin-bottom: 0;
	}

	.heading.outlined {
		position: absolute;
		top: 0;
		left: 0;
		color: transparent;
		-webkit-text-stroke-width: 1px;
		-webkit-text-stroke-color: var(--black);
	}

	.info {
		width: calc(var(--row) / 1.5);
		margin-right: var(--margin);
	}

	.infoHeading {
		margin-bottom: 0.5rem;
	}

	@media (max-width: 768px) {
		.wrapper {
			flex-direction: column;
			align-items: flex-end;
			margin-bottom: 2.5rem;
		}

		.heading {
			margin-bottom: 1.25rem;
		}
	}
</style>
