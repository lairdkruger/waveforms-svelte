<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type { ControlId, NumberControlConfig } from '$lib/visualizers/controls/types'
	import { get, type Writable } from 'svelte/store'
	import InputIcon from '$lib/svgs/InputIcon.svelte'
	import ValidNumberInput from './ValidNumberInput.svelte'
	import type NumberControl from '$lib/visualizers/controls/library/controls/NumberControl'
	import { onDestroy, onMount } from 'svelte'
	import { DragGesture } from '@use-gesture/vanilla'
	import { spring } from 'svelte/motion'
	import { clamp, map } from '$lib/visualizers/utils/Maths'

	export let controlId: ControlId

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId) as NumberControl
	const config = control.config as Writable<NumberControlConfig>

	const draggedSignal = controls.draggedSignal
	$: hasSignalInput = $config.signal ? true : false

	// Dimensions
	const width = 72
	const handleWidth = 24
	const trackWidth = width - handleWidth

	const position = spring(0)

	$: {
		let value = map($position, 0, trackWidth, $config.range[0], $config.range[1])
		let valueClamped = clamp(value, $config.range[0], $config.range[1])
		control.setDefaultValue(valueClamped)
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
	class="g-control"
	on:pointerenter={() => {
		if ($draggedSignal) {
			controls.draggedSignalTarget.set(control)
		}
	}}
	on:pointerleave={() => {
		if ($draggedSignal) {
			controls.draggedSignalTarget.set(null)
		}
	}}
	on:pointerup={() => {
		// Set controller input to signal function
		config.update((config) => {
			config.signal = $draggedSignal ?? undefined
			return config
		})
	}}
>
	<div
		class="g-inputNode"
		on:pointerdown={() => {
			if (hasSignalInput) {
				config.update((config) => {
					config.signal = undefined
					return config
				})
			}
		}}
	>
		<InputIcon active={hasSignalInput} />
	</div>

	<div class="g-label">
		<span class="cpBody">{control.options.label}</span>
	</div>

	<div class="controller">
		<ValidNumberInput
			controlValue={$config.range[0]}
			onValidated={(value) => control.setLowerRange(value)}
			disabled={control.settings?.rangeReadOnly}
		/>
		<div class="slider">
			<div class="track" />
			<div class="handleWrapper">
				<div
					class="handle"
					bind:this={gestureTarget}
					style="transform: translate({$position}px, 0px)"
				>
					<div class="handleBar" />
					<ValidNumberInput
						isHandle={true}
						controlValue={$config.defaultValue}
						onValidated={(value) => control.setDefaultValue(value)}
					/>
				</div>
			</div>
		</div>
		<ValidNumberInput
			controlValue={$config.range[1]}
			onValidated={(value) => control.setUpperRange(value)}
			disabled={control.settings?.rangeReadOnly}
		/>
	</div>
</div>

<style>
	.controller {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
	}

	.slider {
		display: flex;
		align-items: center;
		position: relative;
	}

	.track {
		height: 2px;
		width: 100%;
		background-color: var(--cpColorSecondary);
	}

	.handleWrapper {
		position: absolute;
	}

	.handle {
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		touch-action: none;
	}

	.handle:active {
		cursor: grabbing;
	}

	.handleBar {
		background-color: var(--black);
		height: 24px;
		width: 4px;
		position: absolute;
	}
</style>
