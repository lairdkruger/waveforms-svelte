<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	export let controlId: string

	const { controls, midi } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const controlConfig = control.config

	$: midiActive = $controlConfig.signal?.context === 'midi'
	$: midiLabel = () => {
		if (midi.listening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return $controlConfig.signal?.id.slice(3, 7)
		} else {
			return 'MIDI'
		}
	}

	// Midi events should be cancelled if signal is removed
	$: if (!$controlConfig.signal) midi.cancelListenForMidiInput()
</script>

<button
	class="wrapper"
	class:active={$controlConfig.signal?.context === 'midi'}
	on:click={async () => {
		// Toggle listening off if already listening
		if (midi.listening) {
			midi.cancelListenForMidiInput()
			return
		}

		const midiSignalId = await midi.listenForMidiInput()
		if (!midiSignalId) return null

		// @ts-ignore
		controlConfig.update((config) => {
			if (midi.signals[midiSignalId]) config.signal = midi.signals[midiSignalId]
			return config
		})
	}}
>
	<span class="cpLabel">{midiLabel()}</span>
</button>

<style>
	.wrapper {
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
