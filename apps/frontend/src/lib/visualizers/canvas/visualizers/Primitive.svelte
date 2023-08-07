<script>
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { Group } from 'three'
	import TestBox from '../objects/TestBox.svelte'
	import CameraMovement from '../camera/CameraMovement.svelte'
	import EffectParams from '../effects/EffectParams.svelte'

	const { audioAnalyzer, midi, controls } = getVisualizerContext()

	setContext('primitiveVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, effects, onFrame } = getWebglContext()

	const group = new Group()

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
	})

	$: if ($scene) {
		$scene.add(group)
	}

	onDestroy(() => {})
</script>

<CameraMovement />
<EffectParams />

<TestBox parent={group} range="bass" />
<TestBox parent={group} range="mids" />
<TestBox parent={group} range="highs" />
<TestBox parent={group} range="" />
