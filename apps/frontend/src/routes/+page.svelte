<script>
	import HomePage from '$lib/pages/home/HomePage.svelte'

	export let data

	console.log(data)
</script>

<HomePage visualizersData={data.visualizers} />
