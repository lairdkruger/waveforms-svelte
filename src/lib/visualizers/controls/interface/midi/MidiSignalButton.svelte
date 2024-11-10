<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	interface Props {
		controlId: string
	}

	let { controlId }: Props = $props()

	const { controls, midi } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const controlConfig = control.config
	const midiListening = midi.listening

	let midiActive = $derived(controlConfig.signal?.context === 'midi')
	let midiLabel = $derived.by(() => {
		if (midiListening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return controlConfig.signal?.id.slice(3, 7)
		} else {
			return 'MIDI'
		}
	})

	// Midi events should be cancelled if signal is removed
	$effect(() => {
		if (!controlConfig.signal) midi.cancelListenForMidiInput()
	})
</script>

<button
	class="wrapper"
	class:active={controlConfig.signal?.context === 'midi'}
	onclick={async () => {
		// Toggle listening off if already listening
		if (midiListening) {
			midi.cancelListenForMidiInput()
			return
		}

		const midiSignalId = await midi.listenForMidiInput()
		if (!midiSignalId) return null

		if (midi.signals[midiSignalId]) controlConfig.signal = midi.signals[midiSignalId]
	}}
>
	<span class="cpLabel">{midiLabel}</span>
</button>

<style>
	.wrapper {
		margin-top: 1px;
		padding: 1px 2px 0px 2px;

		border: 1px solid var(--black);
		border-radius: 2px;

		text-align: center;
	}

	.wrapper.active {
		background-color: var(--black);
		color: var(--white);
	}
</style>
