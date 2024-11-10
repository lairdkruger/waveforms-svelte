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

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as ColorControlConfig

	let initialSat = $state(
		rgbToHsv(
			denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
		)[1]
	)
	let initialLight = $state(
		rgbToHsv(
			denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
		)[2]
	)

	let cssColor = $state(
		denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
	)

	let hsl = $state(
		rgbToHsv(
			denormalizeRgb(config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)
		)
	)

	// Dimensions
	const width = 80
	const height = 80
	const handleWidth = 8
	const handleHeight = 8

	const trackWidth = width - handleWidth
	const trackHeight = height - handleHeight

	function updateControl(sat: number, light: number) {
		const saturation = map(sat, 0, trackWidth, 0, 100)
		const lightness = 100 - map(light, 0, trackHeight, 0, 100)

		const rgb = hsvToRgb([hsl[0], saturation, lightness])
		const normalizedRgb = normalizeRgb(rgb)

		const colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!
		colorStop.color = normalizedRgb

		// Sync local states
		cssColor = denormalizeRgb(colorStop.color)
		hsl = rgbToHsv(denormalizeRgb(colorStop.color))
	}

	const positionSat = spring(map(initialSat, 0, 100, 0, trackWidth))
	const positionLight = spring(map(initialLight, 0, 100, trackHeight, 0))

	// TODO: might bug
	positionSat.subscribe((value) => updateControl(value, get(positionLight)))
	positionLight.subscribe((value) => updateControl(get(positionSat), value))

	const handlePointerDown = (event: MouseEvent) => {
		const target = event.target as HTMLDivElement
		const { width, height, left, top } = target.getBoundingClientRect()

		const x = clamp(event.clientX - left, handleWidth / 2, width - handleWidth / 2)
		const y = clamp(event.clientY - top, handleWidth / 2, height - handleHeight / 2)

		const coord = {
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
