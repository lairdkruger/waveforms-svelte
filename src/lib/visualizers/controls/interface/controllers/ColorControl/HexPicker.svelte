<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import {
		denormalizeRgb,
		hexToRgb,
		normalizeRgb,
		rgbToHex
	} from '$lib/visualizers/utils/ColorFunctions'
	import { tick } from 'svelte'
	import type { Writable } from 'svelte/store'

	export let controlId: ControlId
	export let colorStopId: string

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as Writable<ColorControlConfig>

	let currentHex = rgbToHex(
		denormalizeRgb($config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
	)
	$: liveHex = rgbToHex(
		denormalizeRgb($config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
	)
	$: currentHex = liveHex

	let focused = false

	function handleHexSubmit() {
		config.update((config) => {
			const colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!

			if (currentHex?.slice(0, 1) !== '#') {
				currentHex = '#' + currentHex
			}

			const rgb = hexToRgb(currentHex)
			const normalizedRgb = normalizeRgb(rgb)

			colorStop.color = normalizedRgb

			// Sync local state
			currentHex = rgbToHex(rgb)

			return config
		})
	}

	function handleHexChange(event: Event) {
		const target = event.target as HTMLInputElement
		const value = target.value

		// Sync local state
		currentHex = value
	}
</script>

<div class="hex">
	<form
		on:submit={(e) => {
			e.preventDefault()
			handleHexSubmit()
		}}
	>
		<input
			class="hexInput"
			placeholder="Hex"
			value={focused ? currentHex : liveHex}
			on:change={handleHexChange}
			on:focus={() => {
				tick()
				focused = true
			}}
			on:blur={() => (focused = false)}
		/>
	</form>
</div>

<style>
	.hexInput {
		text-align: left;
	}
</style>
