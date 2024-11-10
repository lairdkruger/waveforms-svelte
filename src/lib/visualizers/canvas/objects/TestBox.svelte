<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { onDestroy, onMount } from 'svelte'
	import { BoxGeometry, MeshBasicMaterial, type Group, Mesh, Color } from 'three'

	export let parent: Group
	export let range: '' | 'bass' | 'mids' | 'highs'

	let visualizerContext = getVisualizerContext()
	let { onFrame } = getWebglContext()
	let title = range.charAt(0).toUpperCase() + range.slice(1)

	let geometry = new BoxGeometry(1, 1, 1)
	let materialColor = new Color(0x000000)
	let material = new MeshBasicMaterial({ color: materialColor, transparent: true })
	let mesh = new Mesh(geometry, material)

	let positionX = {
		'': 0,
		bass: -2,
		mids: 0,
		highs: 1.75
	}

	let scaleX = {
		'': 5,
		bass: 1.5,
		mids: 1,
		highs: 0.75
	}

	mesh.position.set(positionX[range], 0, 0)
	mesh.scale.set(scaleX[range], 1, 1)

	let folder = visualizerContext.controls.createFolder(`${range}BoxFolder`, {
		label: `${title === '' ? 'Volume' : title} Box`
	})
	let group = visualizerContext.controls.createGroup(`${range}BoxGroup`, {
		folder: folder,
		label: `${title === '' ? 'Volume' : title} Box`
	})

	let enabled = visualizerContext.controls.createBooleanControl(
		`${range}BoxEnabled`,
		{
			label: 'Enabled',
			group: group
		},
		{ defaultValue: 1 }
	)

	let size = visualizerContext.controls.createNumberControl(
		`${range}BoxSize`,
		{ label: 'Size', group: group },
		{
			defaultValue: 2,
			range: [1, 2],
			signal: visualizerContext.audioAnalyzer.signals[`get${title}Volume`]()
		}
	)

	let opacity = visualizerContext.controls.createNumberControl(
		`${range}BoxOpacity`,
		{ label: 'Opacity', group: group },
		{
			defaultValue: 0.25,
			range: [0.25, 0.5],
			signal:
				visualizerContext.audioAnalyzer.signals[`get${title === '' ? 'Volume' : title}Peaked`]()
		}
	)

	let color = visualizerContext.controls.createColorControl(
		`${range}BoxColor`,
		{ label: 'Color', group: group },
		{
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{ id: '1', coord: 1, color: [1, 1, 1] }
			],
			defaultValue: 0.5,
			signal: visualizerContext.audioAnalyzer.signals[`get${title}Volume`]()
		}
	)

	onFrame(() => {
		if (enabled()) {
			mesh.scale.set(scaleX[range], size(), 1)
			mesh.material.opacity = opacity()
			materialColor.setRGB(...color())
			mesh.material.color.set(materialColor)
		}
	})

	onMount(() => {
		if (parent) {
			parent.add(mesh)
		}
	})

	onDestroy(() => {
		parent.remove(mesh)
	})
</script>
