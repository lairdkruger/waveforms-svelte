<script lang="ts">
	export let name: string
	export let value: string = ''
	export let issue: string | undefined
	export let disabled = false

	let currentValue = value
	let focused = false

	$: empty = currentValue === ''
	$: showPlaceholder = empty && !focused

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		currentValue = target.value
	}
</script>

<div class="wrapper">
	{#if showPlaceholder}
		<label for={name}>{name}</label>
	{/if}
	<textarea
		{name}
		{value}
		{disabled}
		on:focus={() => (focused = true)}
		on:blur={() => (focused = false)}
		on:change={handleChange}
	/>
	{#if issue}
		<span>{issue}</span>
	{/if}
</div>

<style>
	.wrapper {
		position: relative;

		margin-bottom: var(--spacing8);

		display: flex;
		flex-direction: column;
	}

	label {
		position: absolute;
		left: 0;
		pointer-events: none;
	}

	textarea {
		padding-bottom: 2px;
		max-width: 100%;
		min-width: 100%;
	}

	textarea:disabled {
		opacity: 0.5;
	}
</style>
