<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { smokeFragmentShader, smokeVertexShader } from '$lib/visualizers/materials/smokeMaterial'
	import { onDestroy, onMount } from 'svelte'
	import { type Group, Mesh, IcosahedronGeometry, ShaderMaterial, MeshBasicMaterial } from 'three'

	export let parent: Group

	let visualizerContext = getVisualizerContext()
	let webglContext = getWebglContext()

	let radius = 1
	let detail = 5
	let smokeGeometry = new IcosahedronGeometry(radius, detail)
	let smokeMaterial = new ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			lowFreqAmp: { value: 0 },
			midFreqAmp: { value: 0 },
			highFreqAmp: { value: 0 }
		},
		vertexShader: smokeVertexShader,
		fragmentShader: smokeFragmentShader
	})

	let smokeMesh = new Mesh(smokeGeometry, smokeMaterial)

	let folder = visualizerContext.controls.createFolder('noiseSphere', {
		label: 'Noise Sphere'
	})

	let group = visualizerContext.controls.createGroup('noiseSphere', {
		folder: folder,
		label: 'Noise Sphere'
	})

	webglContext.onFrame(({ elapsedTime }) => {
		smokeMesh.material.uniforms.time.value = elapsedTime * 0.5

		smokeMesh.material.uniforms.lowFreqAmp.value =
			visualizerContext.audioAnalyzer.signalFunctions['getBassVolume']() * 0.005

		smokeMesh.material.uniforms.midFreqAmp.value =
			visualizerContext.audioAnalyzer.signalFunctions['getMidsVolume']() * 0.006

		smokeMesh.material.uniforms.highFreqAmp.value =
			visualizerContext.audioAnalyzer.signalFunctions['getHighsVolume']() * 0.06
	})

	onMount(() => {
		if (parent) {
			parent.add(smokeMesh)
		}
	})

	onDestroy(() => {
		parent.remove(smokeMesh)
	})
</script>
