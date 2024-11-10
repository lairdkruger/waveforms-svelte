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

	let initialHue = $state(
		rgbToHsv(control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color)[0]
	)

	let cssColor = $state(
		denormalizeRgb(
			control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
		)
	)

	// Dimensions
	let width = 80
	let handleWidth = 8

	let trackWidth = width - handleWidth

	let position = spring(map(initialHue, 0, 360, 0, trackWidth))
	position.subscribe((value) => updateControl(value))

	function updateControl(value: number) {
		let colorStop = control.config.gradient.find((colorStop) => colorStop.id === colorStopId)!

		let hue = clamp(map(value, 0, trackWidth, 0, 360), 0, 360)
		let saturation = rgbToHsv(denormalizeRgb(colorStop.color))[1]
		let lightness = rgbToHsv(denormalizeRgb(colorStop.color))[2]

		let rgb = hsvToRgb([hue, saturation, lightness])
		let normalizedRgb = normalizeRgb(rgb)

		colorStop.color = normalizedRgb

		// Sync local state
		cssColor = denormalizeRgb(colorStop.color)
	}

	let handlePointerDown = (event: MouseEvent) => {
		let target = event.target as HTMLDivElement
		let { width, left } = target.getBoundingClientRect()

		let x = clamp(event.clientX - left, handleWidth / 2, width - handleWidth / 2)
		let coord = x - handleWidth / 2

		position.set(coord)
	}

	let gesture: DragGesture
	let gestureTarget: HTMLDivElement

	onMount(() => {
		gesture = new DragGesture(
			gestureTarget,
			({ event, offset: [offsetX] }) => {
				if (event.cancelable) event.stopPropagation() // Prevent color stop from dragging too
				position.set(offsetX)
			},
			{
				from: () => [get(position), 0],
				bounds: { left: 0, right: trackWidth }
			}
		)
	})

	onDestroy(() => {
		gesture.destroy()
	})
</script>

<div class="hue" onpointerdown={handlePointerDown}>
	<div
		bind:this={gestureTarget}
		class="g-colorCrosshair"
		style="
			transform: translate({$position}px, 0px);
			background-color: rgb({cssColor});
		"
	>
		<div class="g-outliner"></div>
	</div>
</div>

<style>
	.hue {
		position: relative;

		/* width: 100%; */
		width: 80px;
		height: 8px;

		background-image: linear-gradient(
			to right,
			#ff0000,
			#ffff00,
			#00ff00,
			#00ffff,
			#0000ff,
			#ff00ff,
			#ff0000
		);

		border-radius: 2px;

		cursor: crosshair;
	}
</style>
