<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import {
		denormalizeRgb,
		hexToRgb,
		normalizeRgb,
		rgbToHex
	} from '$lib/visualizers/utils/ColorFunctions'
	import type { Writable } from 'svelte/store'

	export let controlId: ControlId
	export let colorStopId: string

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as Writable<ColorControlConfig>
	const colorStop = $config.gradient.find((colorStop) => colorStop.id === colorStopId)!
	const currentHex = rgbToHex(denormalizeRgb(colorStop.color))

	let inputHex = currentHex

	const handleHexChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		const value = target.value
		inputHex = value
	}

	function handleHexSubmit() {
		let hex = inputHex

		if (hex?.slice(0, 1) !== '#') {
			hex = '#' + hex
		}

		const rgb = hexToRgb(hex)
		const normalizedRgb = normalizeRgb(rgb)

		colorStop.color = normalizedRgb
	}
</script>

<div class="hex">
	<form
		on:submit={(e) => {
			e.preventDefault()
			handleHexSubmit()
		}}
	>
		<input class="hexInput" placeholder="Hex" value={inputHex} on:change={handleHexChange} />
	</form>
</div>

<style>
	.hexInput {
		text-align: left;
	}
</style>
