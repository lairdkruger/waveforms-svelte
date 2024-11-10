<script lang="ts">
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { Color, Group } from 'three'
	import EffectParams from '../../effects/EffectParams.svelte'
	import Background from '../../objects/Background.svelte'
	import CameraMovement from '../../camera/CameraMovement.svelte'
	import NoiseSphere from '../../objects/NoiseSphere.svelte'
	import StormPresets from './StormPresets.svelte'

	const { audioAnalyzer } = getVisualizerContext()
	audioAnalyzer.changeSmoothing(0.96)

	setContext('stormVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, onFrame } = getWebglContext()

	const stormGroup = new Group()

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
		audioAnalyzer.analyzeWaveform()
	})

	$: if ($scene) {
		$scene.add(stormGroup)
	}

	onDestroy(() => {
		if ($scene) {
			$scene.remove(stormGroup)
		}
	})
</script>

<NoiseSphere parent={stormGroup} />
<Background initialColor={new Color(0xffffff)} />
<EffectParams />
<CameraMovement />

<StormPresets />
