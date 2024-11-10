<script lang="ts">
	import BooleanInputIcon from '$lib/svgs/BooleanInputIcon.svelte'
	import InputIcon from '$lib/svgs/InputIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	interface Props {
		controlId: string
		boolean?: boolean
	}

	let { controlId, boolean }: Props = $props()

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config

	const draggedSignal = controls.draggedSignal
	let hasSignalInput = $derived(config.signal ? true : false)
</script>

<div
	class="g-inputNode"
	onpointerenter={() => {
		if (draggedSignal) {
			controls.draggedSignalTarget.set(control)
		}
	}}
	onpointerleave={() => {
		if (draggedSignal) {
			controls.draggedSignalTarget.set(null)
		}
	}}
	onpointerup={() => {
		// Set controller input to signal function
		config.signal = draggedSignal ?? undefined
	}}
	onpointerdown={() => {
		if (hasSignalInput) {
			config.signal = undefined
		}
	}}
>
	{#if boolean}
		<BooleanInputIcon active={hasSignalInput} />
	{:else}
		<InputIcon active={hasSignalInput} />
	{/if}
</div>

<style>
</style>
