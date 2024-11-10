<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { onDestroy, onMount } from 'svelte'
	import { AmbientLight, Group, PerspectiveCamera, PointLight, Vector3 } from 'three'
	// @ts-ignore
	import { OrbitControls } from 'three/addons/controls/OrbitControls'

	export let enabledByDefault: boolean = false

	let visualizerContext = getVisualizerContext()
	let webglContext = getWebglContext()

	let boom = new Group()
	let orbitControls = new OrbitControls(webglContext.camera, webglContext.renderer?.domElement)
	orbitControls.enableDamping = true
	orbitControls.enabled = false

	let folder = visualizerContext.controls.createFolder('camera', { label: 'Camera' })
	let group = visualizerContext.controls.createGroup('movement', {
		label: 'Movement',
		folder: folder
	})

	let orbit = visualizerContext.controls.createBooleanControl(
		'cameraOrbit',
		{ label: 'Orbit', group: group },
		{ defaultValue: enabledByDefault ? 1 : 0 }
	)

	let orbitSpeed = visualizerContext.controls.createNumberControl(
		'cameraOrbitSpeed',
		{ label: 'Orbit Speed', group: group },
		{ defaultValue: 1, range: [0, 10] }
	)

	let fov = visualizerContext.controls.createNumberControl(
		'cameraFov',
		{ label: 'FOV', group: group },
		{ defaultValue: 0.75, range: [0.5, 0.75] },
		{
			transformer: (value) => value * 100
		}
	)

	let positionX = visualizerContext.controls.createNumberControl(
		'cameraPositionX',
		{ label: 'Position X', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	let positionY = visualizerContext.controls.createNumberControl(
		'cameraPositionY',
		{ label: 'Position Y', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	let positionZ = visualizerContext.controls.createNumberControl(
		'cameraPositionZ',
		{ label: 'Position Z', group: group },
		{ defaultValue: 5, range: [-10, 10] }
	)

	let targetX = visualizerContext.controls.createNumberControl(
		'cameraTargetX',
		{ label: 'Target X', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	let targetY = visualizerContext.controls.createNumberControl(
		'cameraTargetY',
		{ label: 'Target Y', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	let targetZ = visualizerContext.controls.createNumberControl(
		'cameraTargetZ',
		{ label: 'Target Z', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	webglContext.onFrame(() => {
		if (!webglContext.camera) return

		// Have to target the camera used by OrbitControls
		let camera = orbitControls.object as PerspectiveCamera

		if (orbit()) {
			orbitControls.autoRotate = true
			orbitControls.autoRotateSpeed = orbitSpeed()
		} else {
			orbitControls.autoRotate = false
			camera.position.set(positionX(), positionY(), positionZ())
			orbitControls.target = new Vector3(targetX(), targetY(), targetZ())
		}

		camera.fov = fov()
		camera.updateProjectionMatrix()

		orbitControls.update()
	})

	let light = new PointLight(0xffffff, 1)
	let ambientLight = new AmbientLight(0xffffff, 0.2)
	light.intensity = 40
	light.position.set(0, 2, 0)

	onMount(() => {
		if (!webglContext.scene) return

		webglContext.scene.add(boom)
		webglContext.scene.add(ambientLight)

		if (!webglContext.camera) return

		boom.add(webglContext.camera)
		webglContext.camera.position.set(0, 0, -5)
		webglContext.camera.lookAt(0, 0, 0)
		webglContext.camera.add(light)
	})

	onDestroy(() => {
		if (!webglContext.scene) return

		webglContext.scene.remove(boom)
	})
</script>
