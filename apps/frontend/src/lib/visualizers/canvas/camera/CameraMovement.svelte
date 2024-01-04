<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { AmbientLight, Group, PointLight } from 'three'

	export let enabledByDefault: boolean = false

	const { controls } = getVisualizerContext()
	const { camera, onFrame, scene } = getWebglContext()

	const boom = new Group()

	const folder = controls.createFolder('camera', { label: 'Camera' })
	const group = controls.createGroup('movement', { label: 'Movement', folder: folder })

	const orbit = controls.createBooleanControl(
		'orbit',
		{ label: 'Enabled', group: group },
		{ defaultValue: enabledByDefault ? 1 : 0 }
	)

	const verticalSpeed = controls.createNumberControl(
		'verticalSpeed',
		{ label: 'Speed Vertical', group: group },
		{ defaultValue: 0, range: [0, 10] },
		{
			transformer: (value) => value / 1000
		}
	)

	const horizontalSpeed = controls.createNumberControl(
		'horizontalSpeed',
		{ label: 'Speed Horizontal', group: group },
		{ defaultValue: 1, range: [0, 10] },
		{
			transformer: (value) => value / 1000
		}
	)

	const fov = controls.createNumberControl(
		'fov',
		{ label: 'FOV', group: group },
		{ defaultValue: 0.75, range: [0.5, 0.75] },
		{
			transformer: (value) => value * 100
		}
	)

	onFrame(() => {
		if ($camera) {
			if ($orbit()) {
				boom.rotateY($horizontalSpeed())
				boom.rotateX($verticalSpeed())

				$camera.fov = $fov()
				$camera.updateProjectionMatrix()
			}
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
