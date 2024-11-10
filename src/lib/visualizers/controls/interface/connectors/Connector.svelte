<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import SignalOptions from './SignalOptions.svelte'

	interface Props {
		controlId: string
	}

	let { controlId }: Props = $props()

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId)

	const audioSignalWidths: Record<string, string> = {
		getVolume: '0.441',
		getVolumePeaked: '0.413',
		getBassVolume: '0.345',
		getBassPeaked: '0.317',
		getMidsVolume: '0.255',
		getMidsPeaked: '0.227',
		getHighsVolume: '0.165',
		getHighsPeaked: '0.137'
	}
</script>

{#if control.config.signal?.context === 'audio'}
	<div
		class="connector"
		style="
			width: {control.config.signal?.context === 'audio'
			? `calc(${audioSignalWidths[control.config.signal?.id]} * var(--cpPanelWidth))`
			: '24px'};
			height: {control.config.signal?.context !== 'audio' ? '0%' : '100000%'}
			"
	>
		{#if control.config.signal?.context === 'audio'}
			<div class="inputNodeIndicator"></div>
		{/if}

		<SignalOptions {controlId} />
	</div>
{/if}

<style>
	.connector {
		position: absolute;
		top: calc(50% - 1px);
		right: calc(var(--cpControlWidth) - 2px);

		width: 100%;
		height: 100000%;

		border-top: 1px solid var(--cpColorSecondary);
		border-left: 1px solid var(--cpColorSecondary);

		pointer-events: none;
	}

	.inputNodeIndicator {
		position: fixed;
		z-index: 1;
		border-radius: 50%;
		background-color: var(--cpColorSecondary);
		width: 4px;
		height: 4px;
		transform: translateX(-2.5px);
		bottom: calc(var(--cpSignalsPanelHeight) + 27px);
	}
</style>
