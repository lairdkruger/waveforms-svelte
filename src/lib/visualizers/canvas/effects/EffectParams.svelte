<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import Signal from '$lib/visualizers/controls/library/signals/Signal.svelte'
	import { clamp, map } from '$lib/visualizers/utils/Maths'
	import { Matrix3 } from 'three'

	let webglContext = getWebglContext()
	let visualizerContext = getVisualizerContext()

	// Kaleidoscope
	let persistanceFolder = visualizerContext.controls.createFolder('persistance', {
		label: 'Persistance'
	})
	let persistanceGroup = visualizerContext.controls.createGroup('frames', {
		label: 'Frames',
		folder: persistanceFolder
	})

	let uvTransformMatrix = new Matrix3()

	let persistanceAmount = visualizerContext.controls.createNumberControl(
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

	let persistanceScaleX = visualizerContext.controls.createNumberControl(
		'persistanceScaleX',
		{ label: 'Scale X', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	let persistanceScaleY = visualizerContext.controls.createNumberControl(
		'persistanceScaleY',
		{ label: 'Scale Y', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-10.0, 200.0]
		}
	)

	let persistanceRotation = visualizerContext.controls.createNumberControl(
		'persistanceRotation',
		{ label: 'Rotation', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		}
	)

	let persistanceTargetRadius = visualizerContext.controls.createNumberControl(
		'persistanceTargetRadius',
		{ label: 'Target Radius', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [0, 10.0]
		},
		{ transformer: (value) => value / 1000 }
	)

	let persistanceTargetAngle = visualizerContext.controls.createNumberControl(
		'persistanceTargetAngle',
		{ label: 'Target Angle', group: persistanceGroup },
		{
			defaultValue: 0,
			range: [-1.0, 1.0]
		},
		{ transformer: (value) => map(value, -1, 1, -Math.PI, Math.PI) }
	)

	// Kaleidoscope
	let kaleidoscopeFolder = visualizerContext.controls.createFolder('kaleidoscope', {
		label: 'Kaleidoscope'
	})
	let kaleidoscopeGroup = visualizerContext.controls.createGroup('kaleidoscope', {
		label: 'Kaleidoscope',
		folder: kaleidoscopeFolder
	})

	let kaleidoscopeSqueeze = visualizerContext.controls.createBooleanControl(
		'kaleidoscopeSqueeze',
		{ label: 'Squeeze', group: kaleidoscopeGroup },
		{
			defaultValue: 0
		}
	)

	let kaleidoscopeSegments = visualizerContext.controls.createNumberControl(
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

	let kaleidoscopeLoops = visualizerContext.controls.createNumberControl(
		'kaleidoscopeLoops',
		{ label: 'Loops', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [1, 4]
		}
	)

	let kaleidoscopeMovement = visualizerContext.controls.createNumberControl(
		'kaleidoscopeMovement',
		{ label: 'Movement', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [1, 0],
			signal: new Signal(
				'audio',
				'getVolume',
				visualizerContext.audioAnalyzer.signalFunctions['getVolume'],
				[() => 0, visualizerContext.audioAnalyzer.signalFunctions['getPeakVolume']],
				{
					ease: 'in',
					behaviour: 'loop'
				}
			)
		},
		{ transformer: (value) => value * (2 * Math.PI) }
	)

	let kaleidoscopeRadius = visualizerContext.controls.createNumberControl(
		'kaleidoscopeRadius',
		{ label: 'Radius', group: kaleidoscopeGroup },
		{
			defaultValue: 0,
			range: [0, 1]
		}
	)

	let kaleidoscopeRotation = visualizerContext.controls.createNumberControl(
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

		webglContext.persistance.uniforms.amount.value = persistanceAmount()

		let uvScaleX = 1 + persistanceScaleX() / 1000
		let uvScaleY = 1 + persistanceScaleY() / 1000
		let uvRotation = persistanceRotation() / 100

		let targetX = Math.cos(persistanceTargetAngle()) * persistanceTargetRadius()
		let targetY = Math.sin(persistanceTargetAngle()) * persistanceTargetRadius()

		uvTransformMatrix.setUvTransform(targetX, targetY, uvScaleX, uvScaleY, uvRotation, 0.5, 0.5)

		webglContext.persistance.uniforms.uvTransformMatrix.value = uvTransformMatrix

		if (!webglContext.postEffect) return

		webglContext.postEffect.uniforms.squeeze.value = kaleidoscopeSqueeze()
		webglContext.postEffect.uniforms.segments.value = kaleidoscopeSegments()
		webglContext.postEffect.uniforms.loops.value = kaleidoscopeLoops()
		webglContext.postEffect.uniforms.movement.value = kaleidoscopeMovement()
		webglContext.postEffect.uniforms.radius.value = kaleidoscopeRadius()
		webglContext.postEffect.uniforms.rotation.value = kaleidoscopeRotation()
	})
</script>
