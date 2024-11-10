<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl.svelte'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import type { Writable } from 'svelte/store'
	import SatLightPicker from './SatLightPicker.svelte'
	import HuePicker from './HuePicker.svelte'
	import HexPicker from './HexPicker.svelte'
	import CrossIcon from '$lib/svgs/CrossIcon.svelte'

	export let controlId: ControlId
	export let colorStopId: string

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId) as ColorControl
	let config = control.config as ColorControlConfig
	let colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!

	function removeColor() {
		// Remove color from gradient (unless it's the last one)
		if (config.gradient.length <= 1) return
		config.gradient = config.gradient.filter((stop) => stop.id !== colorStop.id)
	}
</script>

<div class="wrapper">
	<SatLightPicker {controlId} {colorStopId} />
	<HuePicker {controlId} {colorStopId} />

	<div class="utilities">
		<HexPicker {controlId} {colorStopId} />

		<button
			class="remove"
			onclick={() => {
				removeColor()
			}}
		>
			<CrossIcon />
		</button>
	</div>
</div>

<style>
	.wrapper {
		position: relative;
		left: -50%;

		display: flex;
		flex-direction: column;
		grid-gap: 4px;
		margin-bottom: 12px;

		background-color: var(--cpColorPrimary);
		border-radius: 4px;

		pointer-events: auto;
	}

	.utilities {
		display: flex;
		justify-content: space-between;
		padding-right: 4px;

		pointer-events: auto;
	}
</style>
