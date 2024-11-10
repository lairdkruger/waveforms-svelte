<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import { denormalizeRgb } from '$lib/visualizers/utils/ColorFunctions'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { DragGesture } from '@use-gesture/vanilla'
	import { onDestroy, onMount } from 'svelte'
	import { spring } from 'svelte/motion'
	import ColorPicker from './ColorPicker.svelte'
	import { get, type Writable } from 'svelte/store'

	export let controlId: ControlId
	export let colorStopId: string
	export let trackWidth: number

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as Writable<ColorControlConfig>

	let initialCoord = $config.gradient.find((colorStop) => colorStop.id === colorStopId)!.coord
	$: cssColor = denormalizeRgb(
		$config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
	)

	let colorPickerActive = false

	// Dimensions
	const colorStopWidth = 8
	const width = trackWidth - colorStopWidth

	// Coords
	const position = spring(map(initialCoord, 0, 1, 0, width))

	// Tie defaultValue to position (instant preset changes)
	$: {
		const colorStop = $config.gradient.find((colorStop) => colorStop.id === colorStopId)!
		let valueMapped = map(colorStop.coord, 0, 1, 0, width)

		position.set(valueMapped, { hard: true })
	}

	// Tie position to control defaultValue
	$: {
		config.update((config) => {
			let valueMapped = map($position, 0, width, 0, 1)
			let valueClamped = clamp(valueMapped, 0, 1)

			const colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!
			colorStop.coord = valueClamped

			return config
		})
	}

	// Gestures
	let gesture: DragGesture
	let gestureTarget: HTMLDivElement

	onMount(() => {
		gesture = new DragGesture(
			gestureTarget,
			({ offset: [offsetX] }) => {
				position.set(offsetX)
			},
			{
				from: () => [get(position), 0],
				bounds: { left: 0, right: trackWidth },
				filterTaps: true
			}
		)
	})

	onDestroy(() => {
		gesture.destroy()
	})
</script>

<div
	bind:this={gestureTarget}
	class="g-colorCrosshair"
	style="
		transform: translate({$position}px, 0px); 
		background-color: rgb({cssColor});
	"
>
	<div class="g-outliner noBlend" />

	{#if colorPickerActive}
		<div class="colorPicker">
			<ColorPicker {controlId} {colorStopId} />
		</div>
	{/if}

	<button class="colorPickerToggle" on:click={() => (colorPickerActive = !colorPickerActive)} />
</div>

<style>
	.colorPicker {
		position: absolute;
		bottom: 0;
		left: -50%;
		pointer-events: none;
	}

	.colorPickerToggle {
		position: absolute;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
</style>
