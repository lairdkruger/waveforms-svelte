<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	const { controls, midi } = getVisualizerContext()
	const midiListening = midi.listening
	const preset = controls.presets.preset
	const presets = controls.presets.presets
	$: presetConfig = $presets[$preset]
	$: midiBinding = presetConfig.midiBinding

	$: midiActive = $midiBinding

	$: midiLabel = () => {
		if ($midiListening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return $midiBinding?.slice(3, 7)
		} else {
			return 'MIDI'
		}
	}
</script>

<button
	class="wrapper"
	class:active={midiActive}
	on:click={async () => {
		// Toggle listening off if already listening
		if ($midiListening) {
			midi.cancelListenForMidiInput()
			return
		}

		const midiSignalId = await midi.listenForMidiInput()
		if (!midiSignalId) return null
		if (!midi.signals[midiSignalId]) return null

		midiBinding?.set(midiSignalId)
	}}
>
	<span class="cpLabel">{midiLabel()}</span>
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
