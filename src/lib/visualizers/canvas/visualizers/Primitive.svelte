<script>
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { Group } from 'three'
	import TestBox from '../objects/TestBox.svelte'
	import CameraMovement from '../camera/CameraMovement.svelte'
	import WaveLine from '../objects/WaveLine.svelte'
	import Background from '../objects/Background.svelte'
	import AudioLine from '../objects/AudioLine.svelte'

	const { audioAnalyzer } = getVisualizerContext()

	setContext('primitiveVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, onFrame } = getWebglContext()

	const boxGroup = new Group()
	const waveformGroup = new Group()

	waveformGroup.rotateY(Math.PI / 2)

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
		audioAnalyzer.analyzeWaveform()
	})

	$: if ($scene) {
		$scene.add(boxGroup)
		$scene.add(waveformGroup)
	}

	onDestroy(() => {
		if ($scene) {
			$scene.remove(boxGroup)
			$scene.remove(waveformGroup)
		}
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
