<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl.svelte'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import { denormalizeRgb } from '$lib/visualizers/utils/ColorFunctions'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { DragGesture } from '@use-gesture/vanilla'
	import { onDestroy, onMount } from 'svelte'
	import { spring } from 'svelte/motion'
	import ColorPicker from './ColorPicker.svelte'
	import { get } from 'svelte/store'

	interface Props {
		controlId: ControlId
		colorStopId: string
		trackWidth: number
	}

	let { controlId, colorStopId, trackWidth }: Props = $props()

	let { controls } = getVisualizerContext()
	let control = controls.getControl(controlId) as ColorControl
	let config = control.config

	let initialCoord = $state(
		config.gradient.find((colorStop) => colorStop.id === colorStopId)!.coord
	)
	let cssColor = $derived(
		denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
	)

	let colorPickerActive = $state(false)

	// Dimensions
	const colorStopWidth = 8
	const width = trackWidth - colorStopWidth

	// Coords
	const position = spring(map(initialCoord, 0, 1, 0, width))

	// Tie defaultValue to position (instant preset changes)
	$effect(() => {
		let valueMapped = map(
			config.gradient.find((colorStop) => colorStop.id === colorStopId)!.coord,
			0,
			1,
			0,
			width
		)
		position.set(valueMapped, { hard: true })
	})

	// Tie position to control defaultValue
	$effect(() => {
		let valueMapped = map($position, 0, width, 0, 1)
		let valueClamped = clamp(valueMapped, 0, 1)

		let colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!
		colorStop.coord = valueClamped
	})

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
	<div class="g-outliner noBlend"></div>

	{#if colorPickerActive}
		<div class="colorPicker">
			<ColorPicker {controlId} {colorStopId} />
		</div>
	{/if}

	<button
		class="colorPickerToggle"
		onclick={() => (colorPickerActive = !colorPickerActive)}
		aria-label="Open color picker"
	></button>
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
