<script lang="ts">
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { onDestroy, onMount, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { Color, Group } from 'three'
	import EffectParams from '../../effects/EffectParams.svelte'
	import WaveLine from '../../objects/WaveLine.svelte'
	import Background from '../../objects/Background.svelte'
	import CameraMovement from '../../camera/CameraMovement.svelte'
	import BetaformPresets from './BetaformPresets.svelte'

	let visualizerContext = getVisualizerContext()

	setContext('betaformVisualizer', { audioAnalyzer: visualizerContext.audioAnalyzer })

	let webglContext = getWebglContext()

	let waveformGroup = new Group()

	webglContext.onFrame(() => {
		visualizerContext.audioAnalyzer.analyzeSpectrum(1)
		visualizerContext.audioAnalyzer.analyzeWaveform()
	})

	onMount(() => {
		if (!webglContext.scene) return

		webglContext.scene.add(waveformGroup)
	})

	onDestroy(() => {
		if (!webglContext.scene) return

		webglContext.scene.remove(waveformGroup)
	})
</script>

<WaveLine parent={waveformGroup} label="Main Line" initialColor={new Color(0x000000)} />
<Background initialColor={new Color(0xffffff)} />

<EffectParams />
<CameraMovement />

<BetaformPresets />
