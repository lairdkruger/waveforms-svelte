<script lang="ts">
	import SignalIconBoolean from '$lib/svgs/SignalIconBoolean.svelte'
	import SignalIconNumber from '$lib/svgs/SignalIconNumber.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type Signal from '../../Signal'
	import type { SignalType } from '../../types'

	export let signal: Signal
	export let type: SignalType

	const { controls } = getVisualizerContext()
	const controlPanelRef = controls.controlPanelRef

	let signalIcon: HTMLDivElement
</script>

<div
	id={signal.id}
	class="signal"
	on:pointerdown={(e) => {
		e.stopPropagation()
		controls.draggedSignal.set(signal)

		if ($controlPanelRef) {
			const controlPanelBounds = $controlPanelRef.getBoundingClientRect()
			const signalIconBounds = signalIcon.getBoundingClientRect()
			controls.dragStartCoord.set([
				signalIconBounds.left - controlPanelBounds.left + 7,
				signalIconBounds.top - controlPanelBounds.top
			])
		}
	}}
>
	<div class="signalLabel">
		<span class="cpLabel">
			{type === 'number' ? 'Level' : type === 'boolean' ? 'Peaked' : ''}
		</span>
	</div>

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
