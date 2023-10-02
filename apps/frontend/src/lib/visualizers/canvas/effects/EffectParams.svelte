<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import Signal from '$lib/visualizers/controls/library/signals/Signal'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { Matrix3 } from 'three'

	const { effects, onFrame } = getWebglContext()
	const { controls, audioAnalyzer } = getVisualizerContext()

	const folder = controls.createFolder('effects', { label: 'Effects' })
	const group = controls.createGroup('frames', { label: 'Frames', folder: folder })

	let uvTransformMatrix = new Matrix3()

	const persistance = controls.createNumberControl(
		'persistance',
		{ label: 'Persistance', group: group },
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
		{ label: 'Scale X', group: group },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	const scaleY = controls.createNumberControl(
		'scaleY',
		{ label: 'Scale Y', group: group },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	const rotation = controls.createNumberControl(
		'rotation',
		{ label: 'Rotation', group: group },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		}
	)

	const targetRadius = controls.createNumberControl(
		'targetRadius',
		{ label: 'Target Radius', group: group },
		{
			defaultValue: 0,
			range: [0, 10.0]
		},
		{ transformer: (value) => value / 1000 }
	)

	const targetAngle = controls.createNumberControl(
		'targetAngle',
		{ label: 'Target Angle', group: group },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		},
		{ transformer: (value) => map(value, -1, 1, -Math.PI, Math.PI) }
	)

	onFrame(() => {
		if ($effects) {
			$effects.uniforms.amount.value = $persistance()

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
			// uvTransformMatrix.setUvTransform(0.01, 0.01, 1.03, 1.03, 0, 0.5, 0.5)

			$effects.uniforms.uvTransformMatrix.value = uvTransformMatrix
		}
	})
</script>
