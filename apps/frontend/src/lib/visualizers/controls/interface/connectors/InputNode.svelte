<script lang="ts">
	import BooleanInputIcon from '$lib/svgs/BooleanInputIcon.svelte'
	import InputIcon from '$lib/svgs/InputIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	export let controlId: string
	export let boolean: boolean = false

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config

	const draggedSignal = controls.draggedSignal
	$: hasSignalInput = $config.signal ? true : false
</script>

<div
	class="g-inputNode"
	on:pointerenter={() => {
		if ($draggedSignal) {
			controls.draggedSignalTarget.set(control)
		}
	}}
	on:pointerleave={() => {
		if ($draggedSignal) {
			controls.draggedSignalTarget.set(null)
		}
	}}
	on:pointerup={() => {
		// Set controller input to signal function
		// @ts-expect-error
		config.update((config) => {
			config.signal = $draggedSignal ?? undefined
			return config
		})
	}}
	on:pointerdown={() => {
		if (hasSignalInput) {
			// @ts-expect-error
			config.update((config) => {
				config.signal = undefined
				return config
			})
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
