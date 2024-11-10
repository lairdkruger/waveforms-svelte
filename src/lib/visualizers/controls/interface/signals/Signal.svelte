<script lang="ts">
	import SignalIconBoolean from '$lib/svgs/SignalIconBoolean.svelte'
	import SignalIconNumber from '$lib/svgs/SignalIconNumber.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type Signal from '../../library/signals/Signal.svelte'
	import type { SignalType } from '../../types'

	interface Props {
		signal: () => Signal
		type: SignalType
	}

	let { signal, type }: Props = $props()

	let visualizerContext = getVisualizerContext()

	let signalIcon: HTMLDivElement
</script>

<div
	class="signal"
	onpointerdown={(e) => {
		e.stopPropagation()
		visualizerContext.controls.draggedSignal = signal()

		if (visualizerContext.controls.controlPanelRef) {
			let controlPanelBounds = visualizerContext.controls.controlPanelRef.getBoundingClientRect()
			let signalIconBounds = signalIcon.getBoundingClientRect()

			visualizerContext.controls.dragStartCoord = [
				signalIconBounds.left - controlPanelBounds.left + 7,
				signalIconBounds.top - controlPanelBounds.top
			]
		}
	}}
>
	<span class="cpLabel">
		{type === 'number' ? 'Level' : type === 'boolean' ? 'Peaked' : ''}
	</span>

	<div class="signalIcon" class:boolean={type === 'boolean'} bind:this={signalIcon}>
		{#if type === 'number'}
			<SignalIconNumber />
		{:else if type === 'boolean'}
			<SignalIconBoolean />
		{/if}
	</div>
</div>

<style>
	.signal {
		width: var(--cpSignalHeight);

		display: flex;
		align-items: center;
		justify-content: space-between;

		cursor: pointer;
	}

	.signalIcon {
		height: 14px;
		display: flex;
		align-items: center;
	}

	.signalIcon.boolean {
		position: relative;
		right: -2px;
	}
</style>
