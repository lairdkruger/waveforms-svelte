<script lang="ts">
	export let active: boolean
</script>

<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path
		d="M9.5 6C9.5 7.933 7.933 9.5 6 9.5C4.067 9.5 2.5 7.933 2.5 6C2.5 4.067 4.067 2.5 6 2.5C7.933 2.5 9.5 4.067 9.5 6Z"
		stroke="black"
	/>
	<path d="M6 3V0M9 6H12M6 9V12M3 6H0" stroke="black" />
	{#if active}
		<circle cx="6" cy="6" r="2" fill="black" />
	{/if}
</svg>
