<script lang="ts">
	import './controls.css'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import SignalsPanel from './signals/SignalsPanel.svelte'
	import ControlsPanel from './controls/ControlsPanel.svelte'
	import DragConnector from './connectors/DragConnector.svelte'
	import PresetPanel from './presets/PresetPanel.svelte'

	let controlPanel: HTMLDivElement
	const { controls } = getVisualizerContext()

	$: if (controlPanel) controls.controlPanelRef.set(controlPanel)
</script>

<div class="wrapper">
	<div class="controlPanel">
		<div
			class="controls"
			bind:this={controlPanel}
			on:pointerup={() => controls.resetInteractions()}
		>
			<ControlsPanel />
		</div>
		<div class="signals">
			<SignalsPanel />
		</div>
		<DragConnector />
		<div class="presets">
			<PresetPanel />
		</div>
	</div>
</div>

<style>
	.wrapper {
	}

	.controlPanel {
		position: fixed;
		z-index: 10;
		bottom: 32px;
		right: 32px;

		width: var(--cpPanelWidth);
		height: var(--cpPanelHeight);

		color: var(--cpColorSecondary);

		user-select: none;
		-webkit-user-select: none;
	}

	.presets {
		position: absolute;
		left: var(--cpSpacing24);
		top: var(--cpSpacing8);
	}
</style>
