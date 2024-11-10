<script lang="ts">
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { onDestroy, onMount, setContext } from 'svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { Color, Group } from 'three'
	import EffectParams from '../../effects/EffectParams.svelte'
	import Background from '../../objects/Background.svelte'
	import CameraMovement from '../../camera/CameraMovement.svelte'
	import NoiseSphere from '../../objects/NoiseSphere.svelte'
	import StormPresets from './StormPresets.svelte'

	let visualizerContext = getVisualizerContext()
	visualizerContext.audioAnalyzer.changeSmoothing(0.96)

	setContext('stormVisualizer', { audioAnalyzer: visualizerContext.audioAnalyzer })

	let webglContext = getWebglContext()

	let stormGroup = new Group()

	webglContext.onFrame(() => {
		visualizerContext.audioAnalyzer.analyzeSpectrum(1)
		visualizerContext.audioAnalyzer.analyzeWaveform()
	})

	onMount(() => {
		if (!webglContext.scene) return
		webglContext.scene.add(stormGroup)
	})

	onDestroy(() => {
		if (!webglContext.scene) return
		webglContext.scene.remove(stormGroup)
	})
</script>

<NoiseSphere parent={stormGroup} />
<Background initialColor={new Color(0xffffff)} />
<EffectParams />
<CameraMovement />

<StormPresets />
