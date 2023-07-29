<script>
	import TestBox from '$lib/visualizers/utils/TestBox.svelte'
	import AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { setContext } from 'svelte'

	const audioAnalyzer = new AudioAnalyzer()
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

<div
	on:click={() =>
		audioAnalyzer.audioInput === 'microphone'
			? audioAnalyzer.changeAudioInput('browser')
			: audioAnalyzer.changeAudioInput('microphone')}
/>

<style>
	div {
		width: 100px;
		height: 100px;
		background-color: blue;
	}
</style>
