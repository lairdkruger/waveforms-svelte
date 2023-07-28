<script lang="ts">
	import { onMount } from 'svelte'
	import { createWebglContext } from '../contexts/webgl'

	// References
	let canvas: HTMLCanvasElement

	// Canvas
	const { initWebgl } = createWebglContext()

	onMount(() => {
		initWebgl(canvas)
	})
</script>

<canvas class="canvas" bind:this={canvas} />
<slot />

<style>
	.canvas {
		position: fixed;
		top: 0;
		left: 0;
	}
</style>
