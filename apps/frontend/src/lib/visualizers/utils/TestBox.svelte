<script>
	import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
	import { getWebglContext } from '../contexts/webgl'
	import { getContext, onDestroy } from 'svelte'

	const { scene, onFrame } = getWebglContext()

	let boxGeometry = new BoxGeometry(1, 1, 1)
	let boxMaterial = new MeshBasicMaterial({ color: 0xf00000 })
	let boxMesh = new Mesh(boxGeometry, boxMaterial)
	boxMesh.position.set(0, 0, -5)

	const { audioAnalyzer } = getContext('prototypeVisualizer')

	onFrame(() => {
		boxMesh.rotation.x += 0.01
		boxMesh.rotation.y += 0.01
		boxMesh.scale.set(
			audioAnalyzer.getVolume() / 10,
			audioAnalyzer.getVolume() / 10,
			audioAnalyzer.getVolume() / 10
		)
	})

	$: if ($scene) $scene.add(boxMesh)

	onDestroy(() => {
		$scene?.remove(boxMesh)
	})
</script>
