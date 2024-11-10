<script lang="ts">
	import { capitalize } from '$lib/visualizers/utils/Strings'

	interface Props {
		type?: string
		name: string
		value?: string
		disabled?: boolean
		placeholder?: any
	}

	let { type = 'text', name, value = '', disabled = false, placeholder = name }: Props = $props()

	let currentValue = $state(value)
	let focused = $state(false)

	let empty = $derived(currentValue === '')
	let showPlaceholder = $derived(empty && !focused)

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
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		onchange={handleChange}
	/>
	<div class="underline"></div>
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
