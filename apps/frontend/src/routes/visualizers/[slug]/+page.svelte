<script>
	import Canvas from '$lib/visualizers/canvas/Canvas.svelte'
	import Primitive from '$lib/visualizers/canvas/visualizers/Primitive.svelte'

	export let data

	const visualizerSlug = data.visualizerSlug
</script>

<Canvas>
	{#if visualizerSlug === 'primitive'}
		<Primitive />
	{/if}
</Canvas>
