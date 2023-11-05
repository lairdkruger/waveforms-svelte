<script lang="ts">
	import { capitalize } from '$lib/visualizers/utils/Strings'

	export let type: string = 'text'
	export let name: string
	export let value: string = ''
	export let issue: string | undefined
	export let disabled = false
	export let placeholder = name

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
		<label for={name}>{capitalize(placeholder)}</label>
	{/if}
	<input
		{type}
		{name}
		{value}
		{disabled}
		on:focus={() => (focused = true)}
		on:blur={() => (focused = false)}
		on:change={handleChange}
	/>
	<div class="underline" />
	{#if issue}
		<span class="issue">{issue}</span>
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

	.underline {
		width: 100%;
		height: 1px;

		background-color: var(--black);
	}

	input {
		padding-bottom: 4px;
	}

	input:disabled {
		opacity: 0.5;
	}

	.issue {
		opacity: 0.5;
		margin-top: 2px;
	}
</style>
