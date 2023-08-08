<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { BoxGeometry, MeshBasicMaterial, type Group, Mesh, Color } from 'three'

	export let parent: Group
	export let range: '' | 'bass' | 'mids' | 'highs'

	const { controls, audioAnalyzer } = getVisualizerContext()
	const { onFrame } = getWebglContext()
	const title = range.charAt(0).toUpperCase() + range.slice(1)

	const geometry = new BoxGeometry(1, 1, 1)
	const materialColor = new Color(0x000000)
	const material = new MeshBasicMaterial({ color: materialColor, transparent: true })
	const mesh = new Mesh(geometry, material)

	const positionX = {
		'': 0,
		bass: -2,
		mids: 0,
		highs: 1.75
	}

	const scaleX = {
		'': 5,
		bass: 1.5,
		mids: 1,
		highs: 0.75
	}

	mesh.position.set(positionX[range], 0, 0)
	mesh.scale.set(scaleX[range], 1, 1)

	const folder = controls.createFolder(`${range}BoxFolder`, { label: `${title} Box` })
	const group = controls.createGroup(`${range}BoxGroup`, {
		folder: folder,
		label: `${title} Box`
	})

	const enabled = controls.createBooleanControl(
		`${range}BoxEnabled`,
		{
			label: 'Enabled',
			group: group
		},
		{ defaultValue: 1 }
	)

	const size = controls.createNumberControl(
		`${range}BoxSize`,
		{ label: 'Size', group: group },
		{
			defaultValue: 2,
			range: [1, 2],
			signal: audioAnalyzer.signals[`get${title}Volume`]
		}
	)

	const opacity = controls.createNumberControl(
		`${range}BoxOpacity`,
		{ label: 'Opacity', group: group },
		{
			defaultValue: 0.7,
			range: [0.7, 0.9],
			signal: audioAnalyzer.signals[`get${title}Peaked`]
		}
	)

	const color = controls.createColorControl(
		`${range}BoxColor`,
		{ label: 'Color', group: group },
		{
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{ id: '1', coord: 1, color: [1, 1, 1] }
			],
			signal: audioAnalyzer.signals[`get${title}Volume`],
			defaultValue: 0.5
		}
	)

	onFrame(() => {
		if ($enabled()) {
			mesh.scale.set(scaleX[range], $size(), 1)
			mesh.material.opacity = $opacity()
			materialColor.setRGB(...$color())
			mesh.material.color.set(materialColor)
		}
	})

	$: if (parent) {
		parent.add(mesh)
	}

	onDestroy(() => {
		parent.remove(mesh)
	})
</script>
