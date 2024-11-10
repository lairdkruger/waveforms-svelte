<script lang="ts">
	import BooleanInputIcon from '$lib/svgs/BooleanInputIcon.svelte'
	import InputIcon from '$lib/svgs/InputIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	interface Props {
		controlId: string
		boolean?: boolean
	}

	let { controlId, boolean }: Props = $props()

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId)
	let config = control.config

	let draggedSignal = visualizerContext.controls.draggedSignal
	let hasSignalInput = $derived(config.signal ? true : false)
</script>

<div
	class="g-inputNode"
	onpointerenter={() => {
		if (draggedSignal) {
			visualizerContext.controls.draggedSignalTarget = control
		}
	}}
	onpointerleave={() => {
		if (draggedSignal) {
			visualizerContext.controls.draggedSignalTarget = null
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
