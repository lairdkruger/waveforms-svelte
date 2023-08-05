<script>
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	const { audioAnalyzer, midi, controls } = getVisualizerContext()

	setContext('prototypeVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, onFrame } = getWebglContext()

	let boxGeometry = new BoxGeometry(1, 1, 1)
	let boxMaterial = new MeshBasicMaterial({ color: 0xf00000 })
	let boxMesh = new Mesh(boxGeometry, boxMaterial)
	boxMesh.position.set(0, 0, -5)
	$: if ($scene) $scene.add(boxMesh)

	const folder = controls.createFolder('folder', { label: 'Folder' })

	const colorControl = controls.createColorControl(
		'colorControl',
		{},
		{
			defaultValue: 0.5,
			gradient: [
				{
					id: '0',
					coord: 0,
					color: [0, 0, 0]
				},
				{
					id: '1',
					coord: 0.33,
					color: [0.33, 0.33, 0.33]
				},
				{
					id: '2',
					coord: 0.66,
					color: [0.66, 0.66, 0.66]
				},
				{
					id: '3',
					coord: 1,
					color: [1, 1, 1]
				}
			]
		}
	)

	const spin = controls.createBooleanControl(
		`spin`,
		{ label: 'Spin?', folder: folder },
		{
			defaultValue: 1
		}
	)

	const doubleSize = controls.createBooleanControl(
		'doubleSize',
		{ folder: folder },
		{ defaultValue: 0 }
	)

	const numberControl = controls.createNumberControl('numberControl', {}, { defaultValue: 0.0 })

	const selectControl = controls.createSelectControl(
		'selectControl',
		{},
		{ values: ['wireframe', 'solid'] },
		{
			defaultValue: 'solid'
		}
	)

	const preset = controls.createPreset(
		'presetId',
		{ label: 'Preset Label' },
		{
			spin: {
				defaultValue: 0
			},
			selectControl: {
				defaultValue: 'wireframe'
			},
			numberControl: {
				defaultValue: 1.5
			},
			colorControl: {
				defaultValue: 0.2,
				gradient: [
					{
						id: '7',
						coord: 0,
						color: [1, 0, 0]
					},
					{
						id: '4',
						coord: 0.5,
						color: [0, 1, 0]
					},
					{
						id: '5',
						coord: 1,
						color: [0, 0, 1]
					}
				]
			}
		}
	)

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)

		if ($spin()) {
			boxMesh.rotation.x += 0.01
			boxMesh.rotation.y += 0.01
		}

		boxMesh.scale.set(
			1 + $numberControl() + 2 * $doubleSize(),
			1 + $numberControl() + 2 * $doubleSize(),
			1 + $numberControl() + 2 * $doubleSize()
		)

		if ($selectControl() === 'wireframe') {
			boxMaterial.wireframe = true
		} else {
			boxMaterial.wireframe = false
		}

		boxMaterial.color.set(...$colorControl())

		// boxMesh.scale.set(size(), size(), size())
	})

	onDestroy(() => {
		$scene?.remove(boxMesh)
	})
</script>
