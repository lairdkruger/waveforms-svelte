<script lang="ts">
	import { onMount } from 'svelte'
	import { createWebglContext } from '../contexts/webgl'

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
	on:click={() => {
		started = true
	}}
/>

{#if started}
	<slot />
{/if}

<style>
	.canvas {
		position: fixed;
		z-index: -1;
		top: 0;
		left: 0;
	}
</style>
