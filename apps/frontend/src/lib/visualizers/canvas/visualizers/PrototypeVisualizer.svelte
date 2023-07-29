<script>
	import AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy, setContext } from 'svelte'
	import Midi from '$lib/visualizers/midi/Midi'
	import Controls from '$lib/visualizers/controls/interface/Controls'
	import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

	const audioAnalyzer = new AudioAnalyzer()
	const midi = new Midi()

	const controls = new Controls('prototypeVisualizer', null, audioAnalyzer, midi)

	$: console.log(audioAnalyzer, midi)
	$: console.log(controls)

	setContext('prototypeVisualizer', { audioAnalyzer: audioAnalyzer })

	const { scene, onFrame } = getWebglContext()

	let boxGeometry = new BoxGeometry(1, 1, 1)
	let boxMaterial = new MeshBasicMaterial({ color: 0xf00000 })
	let boxMesh = new Mesh(boxGeometry, boxMaterial)
	boxMesh.position.set(0, 0, -5)
	$: if ($scene) $scene.add(boxMesh)

	const size = controls.createNumberControl(
		`BoxSize`,
		{ label: 'Size', group: 'group' },
		{
			defaultValue: 2,
			range: [1, 2],
			signalFunctionConfig: {
				context: 'audio',
				id: 'getVolume'
			},
			ease: 'linear'
		}
	)

	onFrame(() => {
		audioAnalyzer.analyzeSpectrum(1)

		boxMesh.rotation.x += 0.01
		boxMesh.rotation.y += 0.01
		boxMesh.scale.set(size(), size(), size())
	})

	onDestroy(() => {
		$scene?.remove(boxMesh)
	})
</script>
