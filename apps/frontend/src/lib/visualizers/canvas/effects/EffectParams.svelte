<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { Matrix3 } from 'three'

	const { persistance, postEffect, onFrame } = getWebglContext()
	const { controls, audioAnalyzer } = getVisualizerContext()

	const persistanceFolder = controls.createFolder('persistance', { label: 'Persistance' })
	const persistanceGroup = controls.createGroup('frames', {
		label: 'Frames',
		folder: persistanceFolder
	})

	let uvTransformMatrix = new Matrix3()

	const persistanceAmount = controls.createNumberControl(
		'persistance',
		{ label: 'Persistance', group: persistanceGroup },
		{
			defaultValue: 1,
			range: [0.7, 0.95]
			// signal: new Signal(
			// 	'audio',
			// 	'getHighsVolume',
			// 	audioAnalyzer.signalFunctions['getHighsVolume'],
			// 	[() => 0, audioAnalyzer.signalFunctions['getPeakHighsVolume']],
			// 	{
			// 		ease: 'in',
			// 		booster: new Signal(
			// 			'audio',
			// 			'getVolumePeaked',
			// 			audioAnalyzer.signalFunctions['getVolumePeaked'],
			// 			[() => 0, () => 1]
			// 		)
			// 	}
			// )
		},
		{
			transformer: (value) => clamp(value, 0, 1)
		}
	)

	const scaleX = controls.createNumberControl(
		'scaleX',
		{ label: 'Scale X', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	const scaleY = controls.createNumberControl(
		'scaleY',
		{ label: 'Scale Y', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	const rotation = controls.createNumberControl(
		'rotation',
		{ label: 'Rotation', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		}
	)

	const targetRadius = controls.createNumberControl(
		'targetRadius',
		{ label: 'Target Radius', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [0, 10.0]
		},
		{ transformer: (value) => value / 1000 }
	)

	const targetAngle = controls.createNumberControl(
		'targetAngle',
		{ label: 'Target Angle', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		},
		{ transformer: (value) => map(value, -1, 1, -Math.PI, Math.PI) }
	)

	const kaleidoscopeFolder = controls.createFolder('kaleidoscope', { label: 'Kaleidoscope' })
	const kaleidoscopeGroup = controls.createGroup('kaleidoscope', {
		label: 'Kaleidoscope',
		folder: kaleidoscopeFolder
	})

	const kaleidoscopeSegments = controls.createNumberControl(
		'segments',
		{ label: 'Segments', group: kaleidoscopeGroup },
		{
			defaultValue: 2,
			range: [0, 24]
		},
		{
			transformer: (value) => Math.floor(value)
		}
	)

	const kaleidoscopeRotation = controls.createNumberControl(
		'kaleidoscopeRotation',
		{ label: 'Rotation', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [0, 1]
		},
		{
			transformer: (value) => value * Math.PI * 2
		}
	)

	const kaleidoscopeMovement = controls.createNumberControl(
		'kaleidoscopeMovement',
		{ label: 'Movement', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [0, 1]
		}
	)

	const kaleidoscopeRadius = controls.createNumberControl(
		'kaleidoscopeRadius',
		{ label: 'Radius', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [0, 1]
		}
	)

	const kaleidoscopeStretch = controls.createBooleanControl(
		'kaleidoscopeStretch',
		{ label: 'Stretch', group: kaleidoscopeGroup },
		{
			defaultValue: 0
		}
	)

	onFrame(() => {
		if ($persistance) {
			$persistance.uniforms.amount.value = $persistanceAmount()

			const uvScaleX = 1 + $scaleX() / 1000
			const uvScaleY = 1 + $scaleY() / 1000
			const uvRotation = $rotation() / 100

			const targetX = Math.cos($targetAngle()) * $targetRadius()
			const targetY = Math.sin($targetAngle()) * $targetRadius()

			uvTransformMatrix.setUvTransform(
				targetX,
				targetY,
				uvScaleX,
				uvScaleY,
				uvRotation,
				0.5,
				0.5
			)

			$persistance.uniforms.uvTransformMatrix.value = uvTransformMatrix
		}

		if ($postEffect) {
			$postEffect.uniforms.segments.value = $kaleidoscopeSegments()
			$postEffect.uniforms.rotation.value = $kaleidoscopeRotation()
			$postEffect.uniforms.movement.value = $kaleidoscopeMovement()
			$postEffect.uniforms.radius.value = $kaleidoscopeRadius()
			$postEffect.uniforms.stretch.value = $kaleidoscopeStretch()
		}
	})
</script>
