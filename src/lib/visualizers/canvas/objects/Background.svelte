<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { BoxGeometry, MeshBasicMaterial, Mesh, Color, BackSide } from 'three'

	export let initialColor = new Color(0x000000)

	const { controls } = getVisualizerContext()
	const { onFrame, backgroundScene } = getWebglContext()

	const geometry = new BoxGeometry(1, 1, 1)
	const materialColor = new Color(initialColor)
	const material = new MeshBasicMaterial({ color: materialColor, side: BackSide })
	const mesh = new Mesh(geometry, material)

	mesh.position.set(0, 0, 0)
	mesh.scale.set(10, 10, 10)

	const folder = controls.createFolder('background', { label: 'Background' })
	const group = controls.createGroup('background', {
		folder: folder,
		label: 'Background'
	})

	const color = controls.createColorControl(
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

	onFrame(() => {
		materialColor.setRGB(...$color())
		mesh.material.color.set(materialColor)
	})

	$: if ($backgroundScene) {
		$backgroundScene.add(mesh)
	}

	onDestroy(() => {
		if ($backgroundScene) $backgroundScene.remove(mesh)
	})
</script>
