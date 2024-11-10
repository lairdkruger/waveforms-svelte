<script>
	import { page } from '$app/stores'
	import Canvas from '$lib/visualizers/canvas/Canvas.svelte'
	import Betaform from '$lib/visualizers/canvas/visualizers/betaform/Betaform.svelte'
	import Primitive from '$lib/visualizers/canvas/visualizers/Primitive.svelte'
	import Storm from '$lib/visualizers/canvas/visualizers/storm/Storm.svelte'

	let { slug } = $page.params
</script>

<Canvas>
	{#if slug === 'primitive'}
		<Primitive />
	{:else if slug === 'betaform'}
		<Betaform />
	{:else if slug === 'storm'}
		<Storm />
	{/if}
</Canvas>
