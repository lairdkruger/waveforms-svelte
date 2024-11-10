<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { smokeFragmentShader, smokeVertexShader } from '$lib/visualizers/materials/smokeMaterial'
	import { onDestroy } from 'svelte'
	import { type Group, Mesh, IcosahedronGeometry, ShaderMaterial, MeshBasicMaterial } from 'three'

	export let parent: Group

	const { controls, audioAnalyzer } = getVisualizerContext()
	const webglContext = getWebglContext()

	const radius = 1
	const detail = 5
	const smokeGeometry = new IcosahedronGeometry(radius, detail)
	const smokeMaterial = new ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			lowFreqAmp: { value: 0 },
			midFreqAmp: { value: 0 },
			highFreqAmp: { value: 0 }
		},
		vertexShader: smokeVertexShader,
		fragmentShader: smokeFragmentShader
	})

	const smokeMesh = new Mesh(smokeGeometry, smokeMaterial)

	const folder = controls.createFolder('noiseSphere', {
		label: 'Noise Sphere'
	})

	const group = controls.createGroup('noiseSphere', {
		folder: folder,
		label: 'Noise Sphere'
	})

	webglContext.onFrame(({ elapsedTime }) => {
		smokeMesh.material.uniforms.time.value = elapsedTime * 0.5

		smokeMesh.material.uniforms.lowFreqAmp.value =
			audioAnalyzer.signalFunctions['getBassVolume']() * 0.005

		smokeMesh.material.uniforms.midFreqAmp.value =
			audioAnalyzer.signalFunctions['getMidsVolume']() * 0.006

		smokeMesh.material.uniforms.highFreqAmp.value =
			audioAnalyzer.signalFunctions['getHighsVolume']() * 0.06
	})

	$: if (parent) {
		parent.add(smokeMesh)
	}

	onDestroy(() => {
		parent.remove(smokeMesh)
	})
</script>
