<script lang="ts">
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { Color, Group } from 'three'
	import EffectParams from '../../effects/EffectParams.svelte'
	import WaveLine from '../../objects/WaveLine.svelte'
	import Background from '../../objects/Background.svelte'
	import CameraMovement from '../../camera/CameraMovement.svelte'
	import BetaformPresets from './BetaformPresets.svelte'

	const { audioAnalyzer } = getVisualizerContext()

	setContext('betaformVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, onFrame, renderer } = getWebglContext()

	const waveformGroup = new Group()

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)
		audioAnalyzer.analyzeWaveform()
		// console.log($renderer?.info.memory)
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

<WaveLine parent={waveformGroup} label="Main Line" initialColor={new Color(0x000000)} />
<Background initialColor={new Color(0xffffff)} />

<EffectParams />
<CameraMovement />

<BetaformPresets />
