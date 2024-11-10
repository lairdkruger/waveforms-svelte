<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	interface Props {
		controlId: string
	}

	let { controlId }: Props = $props()

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId)
	let midiListening = visualizerContext.midi.listening

	let midiActive = $derived(control.config.signal?.context === 'midi')
	let midiLabel = $derived.by(() => {
		if (midiListening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return control.config.signal?.id.slice(3, 7)
		} else {
			return 'MIDI'
		}
	})

	// Midi events should be cancelled if signal is removed
	$effect(() => {
		if (!control.config.signal) visualizerContext.midi.cancelListenForMidiInput()
	})
</script>

<button
	class="wrapper"
	class:active={control.config.signal?.context === 'midi'}
	onclick={async () => {
		// Toggle listening off if already listening
		if (midiListening) {
			visualizerContext.midi.cancelListenForMidiInput()
			return
		}

		let midiSignalId = await visualizerContext.midi.listenForMidiInput()
		if (!midiSignalId) return null

		if (visualizerContext.midi.signals[midiSignalId])
			control.config.signal = visualizerContext.midi.signals[midiSignalId]
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
