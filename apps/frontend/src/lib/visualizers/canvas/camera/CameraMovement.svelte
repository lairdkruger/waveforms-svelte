<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { AmbientLight, Group, PerspectiveCamera, PointLight, Vector3 } from 'three'
	// @ts-ignore
	import { OrbitControls } from 'three/addons/controls/OrbitControls'

	export let enabledByDefault: boolean = false

	const { controls } = getVisualizerContext()
	const { camera, onFrame, scene, renderer } = getWebglContext()

	const boom = new Group()
	const orbitControls = new OrbitControls($camera, $renderer?.domElement)
	orbitControls.enableDamping = true
	orbitControls.enabled = false

	const folder = controls.createFolder('camera', { label: 'Camera' })
	const group = controls.createGroup('movement', { label: 'Movement', folder: folder })

	const orbit = controls.createBooleanControl(
		'orbit',
		{ label: 'Orbit', group: group },
		{ defaultValue: enabledByDefault ? 1 : 0 }
	)

	const orbitSpeed = controls.createNumberControl(
		'orbitSpeed',
		{ label: 'Orbit Speed', group: group },
		{ defaultValue: 1, range: [0, 10] }
	)

	const fov = controls.createNumberControl(
		'fov',
		{ label: 'FOV', group: group },
		{ defaultValue: 0.75, range: [0.5, 0.75] },
		{
			transformer: (value) => value * 100
		}
	)

	const positionX = controls.createNumberControl(
		'positionX',
		{ label: 'Position X', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	const positionY = controls.createNumberControl(
		'positionY',
		{ label: 'Position Y', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	const positionZ = controls.createNumberControl(
		'positionZ',
		{ label: 'Position Z', group: group },
		{ defaultValue: 5, range: [-10, 10] }
	)

	const targetX = controls.createNumberControl(
		'targetX',
		{ label: 'Target X', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	const targetY = controls.createNumberControl(
		'targetY',
		{ label: 'Target Y', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	const targetZ = controls.createNumberControl(
		'targetZ',
		{ label: 'Target Z', group: group },
		{ defaultValue: 0, range: [-10, 10] }
	)

	onFrame(() => {
		if ($camera) {
			// Have to target the camera used by OrbitControls
			const camera = orbitControls.object as PerspectiveCamera

			if ($orbit()) {
				orbitControls.autoRotate = true
				orbitControls.autoRotateSpeed = $orbitSpeed()
			} else {
				orbitControls.autoRotate = false
				camera.position.set($positionX(), $positionY(), $positionZ())
				orbitControls.target = new Vector3($targetX(), $targetY(), $targetZ())
			}

			camera.fov = $fov()
			camera.updateProjectionMatrix()

			orbitControls.update()
		}
	})

	const light = new PointLight(0xffffff, 1)
	const ambientLight = new AmbientLight(0xffffff, 0.2)
	light.intensity = 40
	light.position.set(0, 2, 0)

	$: if ($scene) {
		$scene.add(boom)
		$scene.add(ambientLight)
	}

	$: if ($camera) {
		boom.add($camera)
		$camera.position.set(0, 0, -5)
		$camera.lookAt(0, 0, 0)

		$camera.add(light)
	}

	onDestroy(() => {
		$scene?.remove(boom)
	})
</script>
