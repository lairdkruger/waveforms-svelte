<script>
	import Canvas from '$lib/visualizers/canvas/Canvas.svelte'
	import Betaform from '$lib/visualizers/canvas/visualizers/betaform/Betaform.svelte'
	import Primitive from '$lib/visualizers/canvas/visualizers/Primitive.svelte'

	export let data

	const visualizerSlug = data.visualizerSlug
</script>

<Canvas>
	{#if visualizerSlug === 'primitive'}
		<Primitive />
	{:else if visualizerSlug === 'betaform'}
		<Betaform />
	{/if}
</Canvas>
