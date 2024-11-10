<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { onDestroy, onMount } from 'svelte'
	import { BoxGeometry, MeshBasicMaterial, Mesh, Color, BackSide } from 'three'

	export let initialColor = new Color(0x000000)

	let visualizerContext = getVisualizerContext()
	let webglContext = getWebglContext()

	let geometry = new BoxGeometry(1, 1, 1)
	let materialColor = new Color(initialColor)
	let material = new MeshBasicMaterial({ color: materialColor, side: BackSide })
	let mesh = new Mesh(geometry, material)

	mesh.position.set(0, 0, 0)
	mesh.scale.set(10, 10, 10)

	let folder = visualizerContext.controls.createFolder('background', { label: 'Background' })
	let group = visualizerContext.controls.createGroup('background', {
		folder: folder,
		label: 'Background'
	})

	let color = visualizerContext.controls.createColorControl(
		'backgroundColor',
		{ label: 'Background Color', group: group },
		{
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{
					id: '0.5',
					coord: 0.5,
					color: [
						initialColor.toArray()[0],
						initialColor.toArray()[1],
						initialColor.toArray()[2]
					]
				},
				{ id: '1', coord: 1, color: [1, 1, 1] }
			],
			defaultValue: 0.5
		}
	)

	webglContext.onFrame(() => {
		materialColor.setRGB(...color())
		mesh.material.color.set(materialColor)
	})

	onMount(() => {
		if (!webglContext.backgroundScene) return

		webglContext.backgroundScene.add(mesh)
	})

	onDestroy(() => {
		if (!webglContext.backgroundScene) return

		webglContext.backgroundScene.remove(mesh)
	})
</script>
