<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type { ControlId } from '$lib/visualizers/controls/types'
	import InputNode from '../../connectors/InputNode.svelte'
	import MidiSignalButton from '../../midi/MidiSignalButton.svelte'

	interface Props {
		controlId: ControlId
	}

	let { controlId }: Props = $props()

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId)

	let hasActiveSignal = $derived(control.config.signal !== undefined)
</script>

<div class="g-control">
	<div class="g-midi">
		<MidiSignalButton {controlId} />
	</div>

	<InputNode {controlId} boolean={true} />

	<div class="g-label">
		<span class="cpBody">{control.options.label}</span>
	</div>

	<div class="controller">
		<button
			class="checkbox"
			style="
					visibility: {hasActiveSignal ? 'hidden' : 'visible'}
				"
			onclick={() => {
				let value = control.config.defaultValue === 1 ? 0 : 1
				control.config.defaultValue = value
			}}
		>
			{#if control.config.defaultValue === 1}
				<div class="checkboxInner"></div>
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
