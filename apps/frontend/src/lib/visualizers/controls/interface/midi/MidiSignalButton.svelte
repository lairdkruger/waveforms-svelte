<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	export let controlId: string

	const { controls, midi } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config

	$: midiActive = $config.signal?.context === 'midi'
	$: midiLabel = () => {
		if (midi.listening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return $config.signal?.id.slice(3, 7)
		} else {
			return 'MIDI'
		}
	}
</script>

<button
	class="wrapper"
	class:active={$config.signal?.context === 'midi'}
	on:click={async () => {
		// Toggle listening off if already listening
		if (midi.listening) {
			midi.cancelListenForMidiInput()
			return
		}

		const midiSignalId = await midi.listenForMidiInput()
		if (!midiSignalId) return null

		config.update((controlConfig) => {
			console.log('MIDI: ', midiSignalId, midi)

			if (midi.signals[midiSignalId]) controlConfig.signal = midi.signals[midiSignalId]

			return controlConfig
		})
	}}
>
	<span class="cpLabel">{midiLabel()}</span>
</button>

<style>
	.wrapper {
		padding: 0px 2px 1px 2px;

		border: 1px solid var(--black);
		border-radius: 2px;

		text-align: center;
	}

	.wrapper.active {
		background-color: var(--black);
		color: var(--white);
	}
</style>
