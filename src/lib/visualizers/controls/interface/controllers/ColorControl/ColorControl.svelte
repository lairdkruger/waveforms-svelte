<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type ColorControl from '$lib/visualizers/controls/library/controls/ColorControl'
	import type {
		ColorControlConfig,
		ControlId,
		ColorStop as ColorStopType
	} from '$lib/visualizers/controls/types'
	import { get, type Writable } from 'svelte/store'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { DragGesture } from '@use-gesture/vanilla'
	import { onDestroy, onMount } from 'svelte'
	import ColorStop from './ColorStop.svelte'
	import { gradientToCSS } from '$lib/visualizers/utils/ColorFunctions'
	import ColorHandleIcon from '$lib/svgs/ColorHandleIcon.svelte'
	import { spring } from 'svelte/motion'
	import InputNode from '../../connectors/InputNode.svelte'
	import MidiSignalButton from '../../midi/MidiSignalButton.svelte'
	import { getUiContext } from '$lib/contexts/ui.svelte'

	export let controlId: ControlId

	const uiContext = getUiContext()

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as ColorControl
	const config = control.config as Writable<ColorControlConfig>
	$: hasActiveSignal = $config.signal !== undefined

	$: gradient = gradientToCSS($config.gradient)

	// Dimensions
	const width = 120
	const handleWidth = 12
	const trackWidth = width - handleWidth

	const position = spring(map($config.defaultValue, 0, 1, 0, trackWidth))

	// Tie defaultValue to position (instant preset changes)
	$: {
		let valueMapped = map($config.defaultValue, 0, 1, 0, trackWidth)
		position.set(valueMapped, { hard: true })
	}

	// Tie position to control defaultValue
	$: {
		let valueMapped = map($position, 0, trackWidth, 0, 1)
		let valueClamped = clamp(valueMapped, 0, 1)
		config.update((config) => {
			config.defaultValue = valueClamped
			return config
		})
	}

	const addColorStop = (event: MouseEvent) => {
		const target = event.target as HTMLDivElement
		const { width, left } = target.getBoundingClientRect()

		const x = clamp(event.clientX - left, 0, width)
		const coord = map(x, 0, width, 0, 1)

		// Randomise color for fun
		const newColorStop: ColorStopType = {
			id: String(Math.random()),
			coord: coord,
			color: [Math.random(), Math.random(), Math.random()]
		}

		config.update((config) => {
			config.gradient.push(newColorStop)
			return config
		})
	}

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
				bounds: { left: 0, right: trackWidth }
			}
		)
	})

	onDestroy(() => {
		gesture.destroy()
	})
</script>

<div class="g-control">
	<div class="g-midi">
		<MidiSignalButton {controlId} />
	</div>

	<InputNode {controlId} />

	<div class="g-label">
		<span class="cpBody">{control.options.label}</span>
	</div>

	<div class="controller">
		<div class="slider">
			<button
				class="track"
				on:click={(e) => {
					addColorStop(e)
				}}
			>
				<div class="trackGradient" style="background: {gradient}" />
			</button>

			{#each $config.gradient as colorStop (colorStop.id)}
				<ColorStop {controlId} colorStopId={colorStop.id} trackWidth={width} />
			{/each}

			<div
				bind:this={gestureTarget}
				class="handle"
				style="
					transform: translate({$position}px, 0px);
					visibility: {!hasActiveSignal && !uiContext.uiHidden ? 'visible' : 'hidden'}
				"
			>
				<ColorHandleIcon />
			</div>
		</div>
	</div>
</div>

<style>
	.controller {
		position: relative;
	}

	.slider {
		position: relative;
		display: flex;
		align-items: center;

		cursor: crosshair;
	}

	.track {
		position: relative;
		padding: 4px 0;
		width: 120px;
	}

	.trackGradient {
		height: 4px;
		width: 100%;
		border-radius: 2px;
	}

	.handle {
		position: absolute;

		display: flex;
		align-items: center;
		justify-content: center;

		cursor: grab;

		touch-action: none;
	}

	.handle:active {
		cursor: grabbing;
	}
</style>
