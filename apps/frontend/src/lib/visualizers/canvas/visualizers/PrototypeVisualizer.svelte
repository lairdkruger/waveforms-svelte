<script>
	import TestBox from '$lib/visualizers/utils/TestBox.svelte'
	import AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { setContext } from 'svelte'
	import Midi from '$lib/visualizers/midi/Midi'

	const audioAnalyzer = new AudioAnalyzer()
	const midi = new Midi()

	$: console.log(audioAnalyzer, midi)

	setContext('prototypeVisualizer', { audioAnalyzer: audioAnalyzer })

	const { onFrame } = getWebglContext()

	// setInterval(() => {
	// 	console.log(audioAnalyzer.volume)
	// }, 1000)

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
	})
</script>

<TestBox />
