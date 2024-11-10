<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type { ControlId, BooleanControlConfig } from '$lib/visualizers/controls/types'
	import type { Writable } from 'svelte/store'
	import InputNode from '../../connectors/InputNode.svelte'
	import MidiSignalButton from '../../midi/MidiSignalButton.svelte'

	export let controlId: ControlId

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config as Writable<BooleanControlConfig>

	$: hasActiveSignal = $config.signal !== undefined
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
