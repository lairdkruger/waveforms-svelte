<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import SignalOptions from './SignalOptions.svelte'

	export let controlId: string

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config
	$: signalConfig = $config.signal?.function.config

	const audioSignalWidths: Record<string, string> = {
		getVolume: '0.440',
		getVolumePeaked: '0.412',
		getBassVolume: '0.343',
		getBassPeaked: '0.315',
		getMidsVolume: '0.254',
		getMidsPeaked: '0.226',
		getHighsVolume: '0.164',
		getHighsPeaked: '0.136'
	}
</script>

{#if $signalConfig?.context === 'audio'}
	<div
		class="connector"
		style="
			width: {$signalConfig?.context === 'audio'
			? `calc(${audioSignalWidths[$signalConfig?.id]} * var(--cpPanelWidth))`
			: '24px'};
			height: {$signalConfig?.context !== 'audio' ? '0%' : '100000%'}
			"
	>
		{#if $signalConfig?.context === 'audio'}
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
