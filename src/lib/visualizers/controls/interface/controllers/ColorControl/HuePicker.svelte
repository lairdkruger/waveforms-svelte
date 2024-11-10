<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl'
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
	import { get, type Writable } from 'svelte/store'

	export let controlId: ControlId
	export let colorStopId: string

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as Writable<ColorControlConfig>

	let initialHue = rgbToHsv(
		$config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
	)[0]

	$: cssColor = denormalizeRgb(
		$config.gradient.find((colorStop) => colorStop.id === colorStopId)!.color
	)

	// Dimensions
	const width = 80
	const handleWidth = 8

	const trackWidth = width - handleWidth

	const position = spring(map(initialHue, 0, 360, 0, trackWidth))
	$: updateControl($position)

	function updateControl(value: number) {
		config.update((config) => {
			const colorStop = config.gradient.find((colorStop) => colorStop.id === colorStopId)!

			const hue = clamp(map(value, 0, trackWidth, 0, 360), 0, 360)
			const saturation = rgbToHsv(denormalizeRgb(colorStop.color))[1]
			const lightness = rgbToHsv(denormalizeRgb(colorStop.color))[2]

			const rgb = hsvToRgb([hue, saturation, lightness])
			const normalizedRgb = normalizeRgb(rgb)

			colorStop.color = normalizedRgb

			// Sync local state
			cssColor = denormalizeRgb(colorStop.color)

			return config
		})
	}

	const handlePointerDown = (event: MouseEvent) => {
		const target = event.target as HTMLDivElement
		const { width, left } = target.getBoundingClientRect()

		const x = clamp(event.clientX - left, handleWidth / 2, width - handleWidth / 2)
		const coord = x - handleWidth / 2

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

<div class="hue" on:pointerdown={handlePointerDown}>
	<div
		bind:this={gestureTarget}
		class="g-colorCrosshair"
		style="
			transform: translate({$position}px, 0px);
			background-color: rgb({cssColor});
		"
	>
		<div class="g-outliner" />
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
