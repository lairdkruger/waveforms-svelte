<script lang="ts">
	interface Props {
		name: string
		value?: string
		disabled?: boolean
	}

	let { name, value = '', disabled = false }: Props = $props()

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
		<label for={name}>{name}</label>
	{/if}
	<textarea
		{name}
		{value}
		{disabled}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		onchange={handleChange}
	></textarea>
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
		padding-bottom: 4px;
		max-width: 100%;
		min-width: 100%;
	}

	textarea:disabled {
		opacity: 0.5;
	}
</style>
