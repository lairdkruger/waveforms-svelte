<script lang="ts">
	import DropdownIcon from '$lib/svgs/DropdownIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type { ControlId, SelectControlConfig } from '$lib/visualizers/controls/types'
	import InputNode from '../../connectors/InputNode.svelte'
	import type SelectControl from '../../../library/controls/SelectControl.svelte'
	import MidiSignalButton from '../../midi/MidiSignalButton.svelte'

	interface Props {
		controlId: ControlId
	}

	let { controlId }: Props = $props()

	const visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId) as SelectControl
	let hasSignalInput = $derived(control.config.signal !== undefined)

	const handleChange = (event: Event) => {
		const target = event.target as HTMLSelectElement
		control.config.defaultValue = target.value
	}
</script>

<div class="g-control">
	<div class="g-midi">
		<MidiSignalButton {controlId} />
	</div>

	<InputNode {controlId} boolean={true} />

	<div class="g-label">
		<span class="cpBody">{control.options.label}</span>
	</div>

	<div class="g-controller">
		<div class="select">
			<span class="cpHeading">{control.config.defaultValue}</span>
			<div class="dropdownIcon">
				<DropdownIcon />
			</div>

			<select
				class="selectInput"
				value={control.config.defaultValue}
				onchange={handleChange}
				disabled={hasSignalInput}
			>
				{#each control.settings.values as value}
					<option {value}>
						{value}
					</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<style>
	.select {
		position: relative;
		display: flex;
	}

	.dropdownIcon {
		margin-left: 4px;
		margin-top: 2px;
		display: flex;
		align-items: center;
	}

	.selectInput {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		opacity: 0;

		cursor: pointer;
	}
</style>
