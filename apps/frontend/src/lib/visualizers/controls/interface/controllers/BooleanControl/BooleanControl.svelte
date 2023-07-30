<script lang="ts">
	import BooleanInputIcon from '$lib/svgs/BooleanInputIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type { ControlId } from '$lib/visualizers/controls/types'
	import '../controls.css'

	export let controlId: ControlId

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config

	const draggedSignal = controls.draggedSignal

	$: hasSignalInput = $config.signal ? true : false
</script>

<div
	class="g-control"
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
		config.update((config) => {
			config.signal = $draggedSignal ?? undefined
			return config
		})
	}}
>
	<div
		class="g-inputNode"
		on:pointerdown={() => {
			if (hasSignalInput) {
				config.update((config) => {
					config.signal = undefined
					return config
				})
			}
		}}
	>
		<BooleanInputIcon active={hasSignalInput} />
	</div>

	<div class="g-label">
		<span class="cpBody">{control.options.label}</span>
	</div>

	<div class="controller">
		<button
			class="checkbox"
			on:click={() => {
				const value = $config.defaultValue === 1 ? 0 : 1
				$config.defaultValue = value
			}}
		>
			{#if $config.defaultValue === 1}
				<div class="checkboxInner" />
			{/if}
		</button>
	</div>
</div>

<style>
	.controller {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.checkbox {
		width: var(--cpInputSize);
		height: var(--cpInputSize);

		border: 1px solid var(--cpColorSecondary);
		border-radius: 2px;

		overflow: hidden;

		cursor: pointer;
	}

	.checkboxInner {
		width: 100%;
		height: 100%;
		background-color: var(--cpColorSecondary);
	}
</style>
