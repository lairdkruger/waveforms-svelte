<script lang="ts">
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { Color, Group } from 'three'
	import EffectParams from '../../effects/EffectParams.svelte'
	import Background from '../../objects/Background.svelte'
	import CameraMovement from '../../camera/CameraMovement.svelte'
	import BetaformPresets from './StormPresets.svelte'

	const { audioAnalyzer } = getVisualizerContext()

	setContext('stormVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, onFrame } = getWebglContext()

	const waveformGroup = new Group()

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
		audioAnalyzer.analyzeWaveform()
	})

	$: if ($scene) {
		$scene.add(waveformGroup)
	}

	onDestroy(() => {
		if ($scene) {
			$scene.remove(waveformGroup)
		}
	})
</script>

<Background initialColor={new Color(0xffffff)} />
<EffectParams />
<CameraMovement />

<BetaformPresets />
