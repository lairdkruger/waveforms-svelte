<!-- @migration-task Error while migrating Svelte code: `$fullScreen` is an illegal variable name. To reference a global variable called `$fullScreen`, use `globalThis.$fullScreen` -->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import { createWebglContext } from '../contexts/webgl'
	import Stage from './Stage.svelte'
	import { getUiContext } from '$lib/contexts/ui.svelte'

	interface Props {
		children: Snippet
	}

	let { children }: Props = $props()

	const uiContext = getUiContext()

	// References
	let canvas: HTMLCanvasElement

	// State
	let started = $state(false)

	// Canvas
	const { initWebgl } = createWebglContext()

	onMount(() => {
		initWebgl(canvas)
	})
</script>

<canvas
	class="canvas"
	bind:this={canvas}
	onclick={() => uiContext.toggleUiHidden()}
	ondblclick={() => {
		if (!uiContext.fullscreen) {
			uiContext.enterFullScreenMode()
		} else {
			uiContext.exitFullScreenMode()
		}
	}}
></canvas>

{#if !started}
	<button
		class="start-button"
		onclick={() => {
			started = true
		}}
	>
		Start
	</button>
{:else}
	<Stage>
		{@render children()}
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
