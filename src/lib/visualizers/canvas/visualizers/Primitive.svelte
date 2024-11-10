<script>
	import { onDestroy, onMount, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { Group } from 'three'
	import CameraMovement from '../camera/CameraMovement.svelte'
	import Background from '../objects/Background.svelte'
	import AudioLine from '../objects/AudioLine.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'

	let visualizerContext = getVisualizerContext()

	setContext('primitiveVisualizer', { audioAnalyzer: visualizerContext.audioAnalyzer })

	let webglContext = getWebglContext()

	let boxGroup = new Group()
	let waveformGroup = new Group()

	waveformGroup.rotateY(Math.PI / 2)

	webglContext.onFrame(() => {
		visualizerContext.audioAnalyzer.analyzeSpectrum(1)
		visualizerContext.audioAnalyzer.analyzeWaveform()
	})

	onMount(() => {
		if (!webglContext.scene) return

		webglContext.scene.add(boxGroup)
		webglContext.scene.add(waveformGroup)
	})

	onDestroy(() => {
		if (!webglContext.scene) return

		webglContext.scene.remove(boxGroup)
		webglContext.scene.remove(waveformGroup)
	})
</script>

<AudioLine parent={waveformGroup} />
<!-- <WaveLine parent={waveformGroup} label="Top Line" /> -->

<!-- <TestBox parent={boxGroup} range="bass" /> -->
<!-- <TestBox parent={boxGroup} range="mids" /> -->
<!-- <TestBox parent={boxGroup} range="highs" /> -->
<!-- <TestBox parent={boxGroup} range="" /> -->

<Background />

<CameraMovement enabledByDefault={false} />
