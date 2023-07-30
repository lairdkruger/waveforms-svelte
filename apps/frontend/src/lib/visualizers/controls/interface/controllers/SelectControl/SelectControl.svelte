<script lang="ts">
	import DropdownIcon from '$lib/svgs/DropdownIcon.svelte'
	import InputIcon from '$lib/svgs/InputIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type { ControlId, SelectControl } from '$lib/visualizers/controls/types'

	export let controlId: ControlId

	const { controls } = getVisualizerContext()
	const controlsStore = controls.controls.controls
	$: control = $controlsStore[controlId]

	const handleChange = (event: Event) => {
		const target = event.target as HTMLSelectElement
		controls.setSelectControlValue(control.id, target.value)
		// control = control // Enable svelte reactivity
	}
</script>

<div class="g-control">
	<div class="g-inputNode">
		<InputIcon active={false} />
	</div>

	<div class="g-label">
		<span class="cpBody">{control.label}</span>
	</div>

	<div class="g-controller">
		<div class="select">
			<span class="cpHeading">{control.defaultValue}</span>
			<div class="dropdownIcon">
				<DropdownIcon />
			</div>

			<select class="selectInput" value={control.defaultValue} on:change={handleChange}>
				{#each control.values as value}
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
