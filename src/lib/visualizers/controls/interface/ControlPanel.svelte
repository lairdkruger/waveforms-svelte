<script lang="ts">
	import './controls.css'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import SignalsPanel from './signals/SignalsPanel.svelte'
	import ControlsPanel from './controls/ControlsPanel.svelte'
	import DragConnector from './connectors/DragConnector.svelte'
	import PresetPanel from './presets/PresetPanel.svelte'
	import { getUiContext } from '$lib/contexts/ui.svelte'
	import { onMount } from 'svelte'

	const uiContext = getUiContext()

	let controlPanel: HTMLDivElement | null = $state(null)
	const visualizerContext = getVisualizerContext()

	onMount(() => {
		visualizerContext.controls.controlPanelRef = controlPanel
	})
</script>

<div class="wrapper" class:hidden={uiContext.uiHidden}>
	<div class="controlPanel">
		<div
			class="controls"
			bind:this={controlPanel}
			onpointerup={() => visualizerContext.controls.resetInteractions()}
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
		visibility: visible;
	}

	.hidden {
		visibility: hidden;
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

		@media (max-width: 768px) {
			width: auto;
			height: auto;

			bottom: var(--spacing16);
			right: var(--margin);
		}
	}

	.controls {
		@media (max-width: 768px) {
			display: none;
		}
	}

	.signals {
		@media (max-width: 768px) {
			display: none;
		}
	}

	.presets {
		position: absolute;
		left: var(--cpSpacing24);
		top: var(--cpSpacing8);

		@media (max-width: 768px) {
			position: relative;
			left: auto;
			top: auto;
		}
	}
</style>
