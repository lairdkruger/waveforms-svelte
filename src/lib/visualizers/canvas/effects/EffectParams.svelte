<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import Signal from '$lib/visualizers/controls/library/signals/Signal'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { Matrix3 } from 'three'

	const webglContext = getWebglContext()
	const { controls, audioAnalyzer } = getVisualizerContext()

	// Kaleidoscope
	const persistanceFolder = controls.createFolder('persistance', { label: 'Persistance' })
	const persistanceGroup = controls.createGroup('frames', {
		label: 'Frames',
		folder: persistanceFolder
	})

	let uvTransformMatrix = new Matrix3()

	const persistanceAmount = controls.createNumberControl(
		'persistanceAmount',
		{ label: 'Persistance', group: persistanceGroup },
		{
			defaultValue: 0,
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

	const persistanceScaleX = controls.createNumberControl(
		'persistanceScaleX',
		{ label: 'Scale X', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	const persistanceScaleY = controls.createNumberControl(
		'persistanceScaleY',
		{ label: 'Scale Y', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	const persistanceRotation = controls.createNumberControl(
		'persistanceRotation',
		{ label: 'Rotation', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		}
	)

	const persistanceTargetRadius = controls.createNumberControl(
		'persistanceTargetRadius',
		{ label: 'Target Radius', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [0, 10.0]
		},
		{ transformer: (value) => value / 1000 }
	)

	const persistanceTargetAngle = controls.createNumberControl(
		'persistanceTargetAngle',
		{ label: 'Target Angle', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		},
		{ transformer: (value) => map(value, -1, 1, -Math.PI, Math.PI) }
	)

	// Kaleidoscope
	const kaleidoscopeFolder = controls.createFolder('kaleidoscope', { label: 'Kaleidoscope' })
	const kaleidoscopeGroup = controls.createGroup('kaleidoscope', {
		label: 'Kaleidoscope',
		folder: kaleidoscopeFolder
	})

	const kaleidoscopeSqueeze = controls.createBooleanControl(
		'kaleidoscopeSqueeze',
		{ label: 'Squeeze', group: kaleidoscopeGroup },
		{
			defaultValue: 0
		}
	)

	const kaleidoscopeSegments = controls.createNumberControl(
		'kaleidoscopeSegments',
		{ label: 'Segments', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [0, 24]
		},
		{
			transformer: (value) => Math.floor(value)
		}
	)

	const kaleidoscopeLoops = controls.createNumberControl(
		'kaleidoscopeLoops',
		{ label: 'Loops', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [1, 4]
		}
	)

	const kaleidoscopeMovement = controls.createNumberControl(
		'kaleidoscopeMovement',
		{ label: 'Movement', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [1, 0],
			signal: new Signal(
				'audio',
				'getVolume',
				audioAnalyzer.signalFunctions['getVolume'],
				[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
				{
					ease: 'in',
					behaviour: 'loop'
				}
			)
		},
		{ transformer: (value) => value * (2 * Math.PI) }
	)

	const kaleidoscopeRadius = controls.createNumberControl(
		'kaleidoscopeRadius',
		{ label: 'Radius', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [0, 1]
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

	webglContext.onFrame(() => {
		if (!webglContext.persistance) return

		webglContext.persistance.uniforms.amount.value = $persistanceAmount()

		const uvScaleX = 1 + $persistanceScaleX() / 1000
		const uvScaleY = 1 + $persistanceScaleY() / 1000
		const uvRotation = $persistanceRotation() / 100

		const targetX = Math.cos($persistanceTargetAngle()) * $persistanceTargetRadius()
		const targetY = Math.sin($persistanceTargetAngle()) * $persistanceTargetRadius()

		uvTransformMatrix.setUvTransform(targetX, targetY, uvScaleX, uvScaleY, uvRotation, 0.5, 0.5)

		webglContext.persistance.uniforms.uvTransformMatrix.value = uvTransformMatrix

		if (!webglContext.postEffect) return

		webglContext.postEffect.uniforms.squeeze.value = $kaleidoscopeSqueeze()
		webglContext.postEffect.uniforms.segments.value = $kaleidoscopeSegments()
		webglContext.postEffect.uniforms.loops.value = $kaleidoscopeLoops()
		webglContext.postEffect.uniforms.movement.value = $kaleidoscopeMovement()
		webglContext.postEffect.uniforms.radius.value = $kaleidoscopeRadius()
		webglContext.postEffect.uniforms.rotation.value = $kaleidoscopeRotation()
	})
</script>
