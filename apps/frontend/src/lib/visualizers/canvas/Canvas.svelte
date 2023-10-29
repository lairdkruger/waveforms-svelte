<script lang="ts">
	import { onMount } from 'svelte'
	import { createWebglContext } from '../contexts/webgl'
	import Stage from './Stage.svelte'
	import { fullScreen, uiHidden } from '../../stores/UiStore'

	// References
	let canvas: HTMLCanvasElement

	// State
	let started = false

	// Canvas
	const { initWebgl } = createWebglContext()

	onMount(() => {
		initWebgl(canvas)
	})
</script>

<canvas
	class="canvas"
	bind:this={canvas}
	on:click={() => uiHidden.update((value) => !value)}
	on:dblclick={() => {
		if (!$fullScreen) {
			fullScreen.enterFullScreenMode()
		} else {
			fullScreen.exitFullScreenMode()
		}
	}}
/>

{#if !started}
	<button
		class="start-button"
		on:click={() => {
			started = true
		}}
	>
		Start
	</button>
{:else}
	<Stage>
		<slot />
	</Stage>
{/if}

<style>
	.canvas {
		position: fixed;
		z-index: -1;
		top: 0;
		left: 0;
	}

	.start-button {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
