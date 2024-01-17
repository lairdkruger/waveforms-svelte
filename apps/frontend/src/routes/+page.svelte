<script lang="ts">
	import HomePage from '$lib/pages/home/HomePage.svelte'
	import init from 'rusty' // Doesn't work on server dynamic import required
	import { onMount } from 'svelte'

	onMount(async () => {
		init().then((RUSTY) => {
			RUSTY.greet()
		})
	})

	export let data
</script>

<HomePage visualizersData={data.visualizers} />
