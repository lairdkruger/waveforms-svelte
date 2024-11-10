<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl.svelte'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import {
		denormalizeRgb,
		hexToRgb,
		normalizeRgb,
		rgbToHex
	} from '$lib/visualizers/utils/ColorFunctions'
	import { tick } from 'svelte'

	interface Props {
		controlId: ControlId
		colorStopId: string
	}

	let { controlId, colorStopId }: Props = $props()

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as ColorControlConfig

	let currentHex = $state(
		rgbToHex(
			denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
		)
	)
	let liveHex = $derived(
		rgbToHex(
			denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
		)
	)

	let focused = $state(false)

	function handleHexSubmit() {
		const colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!

		if (currentHex?.slice(0, 1) !== '#') {
			currentHex = '#' + currentHex
		}

		const rgb = hexToRgb(currentHex)
		const normalizedRgb = normalizeRgb(rgb)

		colorStop.color = normalizedRgb

		// Sync local state
		currentHex = rgbToHex(rgb)
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
		onsubmit={(e) => {
			e.preventDefault()
			handleHexSubmit()
		}}
	>
		<input
			class="hexInput"
			placeholder="Hex"
			value={focused ? currentHex : liveHex}
			onchange={handleHexChange}
			onfocus={() => {
				tick()
				focused = true
			}}
			onblur={() => (focused = false)}
		/>
	</form>
</div>

<style>
	.hexInput {
		text-align: left;
	}
</style>
