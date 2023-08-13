<script lang="ts">
	import { onMount } from 'svelte'

	export let active: boolean
	export let muxId: string

	onMount(async () => {
		await import('@mux/mux-video')
	})
</script>

<div class="wrapper">
	<div class="cover" style="opacity: {active ? 1 : 0}">
		<mux-video stream-type="on-demand" playback-id={muxId} muted loop autoplay />
	</div>
</div>

<style>
	.wrapper {
		position: fixed;
		z-index: -1;
		top: 0;
		left: 0;

		width: 100%;
		min-width: 100%;
		height: 100vh;

		overflow: hidden;
		pointer-events: none;
	}

	.cover {
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 50%;

		height: 100%;
		min-width: 100%;
		object-fit: cover;

		transform: translateX(-50%) translateY(-50%);
		transition: opacity var(--motionDefault);

		overflow: hidden;
	}

	mux-video {
		display: block;
		width: 100%;
		height: 100%;

		--media-object-fit: cover;
		--media-object-position: center;
	}
</style>
