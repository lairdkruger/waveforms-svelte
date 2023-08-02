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

	// const size = controls.createNumberControl(
	// 	`BoxSize`,
	// 	{ label: 'Size', group: 'group' },
	// 	{
	// 		defaultValue: 2,
	// 		range: [1, 2],
	// 		signalFunctionConfig: {
	// 			context: 'audio',
	// 			id: 'getVolume'
	// 		},
	// 		ease: 'linear'
	// 	}
	// )

	// const multiple = controls.createSelectControl(
	// 	`BoxMultiple`,
	// 	{ label: 'Size', group: 'group' },
	// 	{
	// 		values: ['1', '8'],
	// 		defaultValue: '1'
	// 	}
	// )

	const colorControl = controls.createColorControl('colorControl')

	$: console.log($colorControl())

	const spin = controls.createBooleanControl(
		`BoxSpinning`,
		{ label: 'Spin?', group: 'group', folder: 'folder' },
		{
			defaultValue: 1
		}
	)

	const doubleSize = controls.createBooleanControl('doubleSize')

	const numberControl = controls.createNumberControl('numberControl')

	const selectControl = controls.createSelectControl(
		'selectControl',
		{},
		{
			values: ['wireframe', 'solid'],
			defaultValue: 'solid'
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
