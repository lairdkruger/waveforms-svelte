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

	let hasSignalInput = $derived(control.config.signal ? true : false)
</script>

<div
	class="g-inputNode"
	onpointerenter={() => {
		if (visualizerContext.controls.draggedSignal) {
			visualizerContext.controls.draggedSignalTarget = control
		}
	}}
	onpointerleave={() => {
		if (visualizerContext.controls.draggedSignal) {
			visualizerContext.controls.draggedSignalTarget = null
		}
	}}
	onpointerup={() => {
		// Set controller input to signal function
		control.config.signal = visualizerContext.controls.draggedSignal ?? undefined
	}}
	onpointerdown={() => {
		if (hasSignalInput) {
			control.config.signal = undefined
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
