<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	let visualizerContext = getVisualizerContext()
	let midiListening = visualizerContext.midi.listening
	let preset = visualizerContext.controls.presets.preset
	let presets = visualizerContext.controls.presets.presets
	let presetConfig = presets[preset]
	let midiBinding = presetConfig.midiBinding

	let midiActive = midiBinding

	let midiLabel = $derived.by(() => {
		if (midiListening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return midiBinding?.slice(3, 7)
		} else {
			return 'MIDI'
		}
	})
</script>

<button
	class="wrapper"
	class:active={midiActive}
	onclick={async () => {
		// Toggle listening off if already listening
		if (midiListening) {
			visualizerContext.midi.cancelListenForMidiInput()
			return
		}

		let midiSignalId = await visualizerContext.midi.listenForMidiInput()
		if (!midiSignalId) return null
		if (!visualizerContext.midi.signals[midiSignalId]) return null

		midiBinding = midiSignalId
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
