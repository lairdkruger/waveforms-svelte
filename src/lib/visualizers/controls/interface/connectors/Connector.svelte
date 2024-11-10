<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import SignalOptions from './SignalOptions.svelte'

	export let controlId: string

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config
	$: signal = $config.signal

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

{#if signal?.context === 'audio'}
	<div
		class="connector"
		style="
			width: {signal?.context === 'audio'
			? `calc(${audioSignalWidths[signal?.id]} * var(--cpPanelWidth))`
			: '24px'};
			height: {signal?.context !== 'audio' ? '0%' : '100000%'}
			"
	>
		{#if signal?.context === 'audio'}
			<div class="inputNodeIndicator" />
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
