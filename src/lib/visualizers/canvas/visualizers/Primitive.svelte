<script>
	import { onDestroy, onMount, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { Group } from 'three'
	import CameraMovement from '../camera/CameraMovement.svelte'
	import Background from '../objects/Background.svelte'
	import AudioLine from '../objects/AudioLine.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'

	const { audioAnalyzer } = getVisualizerContext()

	setContext('primitiveVisualizer', { audioAnalyzer: audioAnalyzer })

	const webglContext = getWebglContext()

	const boxGroup = new Group()
	const waveformGroup = new Group()

	waveformGroup.rotateY(Math.PI / 2)

	webglContext.onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
		audioAnalyzer.analyzeWaveform()
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
