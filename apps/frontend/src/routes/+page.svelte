<script>
	import HomePage from '$lib/pages/home/HomePage.svelte'

	export let data
</script>

<HomePage visualizersData={data.visualizers} />
