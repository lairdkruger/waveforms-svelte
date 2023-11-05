<script lang="ts">
	import ArrowIcon from '$lib/svgs/ArrowIcon.svelte'
	import type { Visualizer } from 'supabase'

	export let visualizer: Visualizer
	export let active: boolean
	export let inactive: boolean

	let arrowWidth = 72
</script>

<a href="/visualizers/{visualizer.slug}" data-sveltekit-preload-data="off">
	<div
		class="wrapper"
		style="
		transform: translate3D({active ? -arrowWidth : 0}px, 0, 0);
		color: {active ? '#ffffff' : '#000000'};
		mixBlendMode: {active ? 'difference' : 'normal'}
	"
	>
		<div class="arrowWrapper" bind:clientWidth={arrowWidth}>
			<div class="arrow">
				<ArrowIcon />
			</div>
		</div>

		<div class="heading-wrapper">
			<h2 class="heading-large" style="opacity: {inactive ? 0 : 1}">
				{visualizer.name}
			</h2>
			<h2 class="heading-large outlined" style=" opacity: {inactive ? 1 : 0} ">
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
	a:hover {
		opacity: 1;
	}

	.wrapper {
		cursor: pointer;
		display: flex;
		flex-direction: row-reverse;
		margin-bottom: 0;
		transition: transform var(--motionDefault);

		backface-visibility: visible;

		mix-blend-mode: var(--mixBlendMode);
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
		width: calc(7.5vw + 20px);
		padding-left: 20px;
		color: var(--white);
	}

	.heading-wrapper {
		position: relative;
		margin-bottom: 0;
	}

	.heading-large.outlined {
		position: absolute;
		top: 0;
		left: 0;
		color: var(--white);
		-webkit-text-stroke-width: 1px;
		-webkit-text-stroke-color: var(--white);
	}

	.info {
		width: calc(var(--row) / 1.5);
		margin-right: var(--margin);
		color: var(--white);
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

		.heading-large {
			margin-bottom: 1.25rem;
		}
	}
</style>
