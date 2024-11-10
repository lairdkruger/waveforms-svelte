<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl.svelte'
	import type { ColorControlConfig, ControlId } from '$lib/visualizers/controls/types'
	import {
		denormalizeRgb,
		hsvToRgb,
		normalizeRgb,
		rgbToHsv
	} from '$lib/visualizers/utils/ColorFunctions'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { DragGesture } from '@use-gesture/vanilla'
	import { onDestroy, onMount } from 'svelte'
	import { spring } from 'svelte/motion'
	import { get } from 'svelte/store'

	interface Props {
		controlId: ControlId
		colorStopId: string
	}

	let { controlId, colorStopId }: Props = $props()

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId) as ColorControl

	let initialSat = $state(
		rgbToHsv(
			denormalizeRgb(
				control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
			)
		)[1]
	)
	let initialLight = $state(
		rgbToHsv(
			denormalizeRgb(
				control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
			)
		)[2]
	)

	let cssColor = $state(
		denormalizeRgb(
			control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
		)
	)

	let hsl = $state(
		rgbToHsv(
			denormalizeRgb(
				control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
			)
		)
	)

	// Dimensions
	let width = 80
	let height = 80
	let handleWidth = 8
	let handleHeight = 8

	let trackWidth = width - handleWidth
	let trackHeight = height - handleHeight

	function updateControl(sat: number, light: number) {
		let saturation = map(sat, 0, trackWidth, 0, 100)
		let lightness = 100 - map(light, 0, trackHeight, 0, 100)

		let rgb = hsvToRgb([hsl[0], saturation, lightness])
		let normalizedRgb = normalizeRgb(rgb)

		let colorStop = control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!
		colorStop.color = normalizedRgb

		// Sync local states
		cssColor = denormalizeRgb(colorStop.color)
		hsl = rgbToHsv(denormalizeRgb(colorStop.color))
	}

	let positionSat = spring(map(initialSat, 0, 100, 0, trackWidth))
	let positionLight = spring(map(initialLight, 0, 100, trackHeight, 0))

	positionSat.subscribe((value) => updateControl(value, get(positionLight)))
	positionLight.subscribe((value) => updateControl(get(positionSat), value))

	let handlePointerDown = (event: MouseEvent) => {
		let target = event.target as HTMLDivElement
		let { width, height, left, top } = target.getBoundingClientRect()

		let x = clamp(event.clientX - left, handleWidth / 2, width - handleWidth / 2)
		let y = clamp(event.clientY - top, handleWidth / 2, height - handleHeight / 2)

		let coord = {
			x: x - handleWidth / 2,
			y: y - handleHeight / 2
		}

		positionSat.set(coord.x)
		positionLight.set(coord.y)
	}

	let gesture: DragGesture
	let gestureTarget: HTMLDivElement

	onMount(() => {
		gesture = new DragGesture(
			gestureTarget,
			({ event, offset: [offsetX, offsetY] }) => {
				if (event.cancelable) event.stopPropagation() // Prevent color stop from dragging too
				positionSat.set(offsetX)
				positionLight.set(offsetY)
			},
			{
				from: () => [get(positionSat), get(positionLight)],
				bounds: { left: 0, right: trackWidth, top: 0, bottom: trackHeight }
			}
		)
	})

	onDestroy(() => {
		gesture.destroy()
	})
</script>

<div
	class="saturation"
	style="
		background-color: hsl({hsl[0]}, 100%, 50%)
	"
	onpointerdown={handlePointerDown}
>
	<div
		bind:this={gestureTarget}
		class="g-colorCrosshair"
		style="
			transform: translate({$positionSat}px, {$positionLight}px);
			background-color: rgb({cssColor});
		"
	>
		<div class="g-outliner"></div>
	</div>
</div>

<style>
	.saturation {
		position: relative;

		width: 80px;
		height: 80px;

		background-image: linear-gradient(transparent, black),
			linear-gradient(to right, white, transparent);

		border-radius: 4px;

		cursor: crosshair;
	}
</style>
