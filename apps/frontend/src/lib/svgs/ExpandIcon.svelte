<script lang="ts">
	export let active: boolean
</script>

<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
	<circle cx="4" cy="4" r="3.5" stroke="currentColor" />
	<path d="M2 4H6" stroke="currentColor" />
	{#if active}
		<path d="M4 2L4 6" stroke="currentColor" />
	{/if}
</svg>
