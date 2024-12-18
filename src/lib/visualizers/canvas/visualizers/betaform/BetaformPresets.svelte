<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import Signal from '$lib/visualizers/controls/library/signals/Signal'

	const { controls, audioAnalyzer } = getVisualizerContext()

	// Zen
	controls.createPreset(
		'zen',
		{
			label: 'Zen'
		},
		{
			// Waveline
			wavelineShape: { defaultValue: 'Line' },
			wavelineIntensity: { defaultValue: 0.5 },
			wavelinePositionZ: { defaultValue: 1.5 },
			wavelineRotationX: { defaultValue: -0.5 },
			wavelineDirection: { defaultValue: 'Perpendicular' },
			wavelineSymmetry: { defaultValue: 3 },
			wavelineThickness: { defaultValue: 1.5 },
			wavelineClones: { defaultValue: 80 },
			wavelineCloneSpacing: { defaultValue: 0.035 },
			wavelineFlowShape: { defaultValue: 1 },
			wavelineFlowColors: { defaultValue: 1 },
			wavelineColor: {
				defaultValue: 0.0,
				gradient: [
					{ id: '0', coord: 0, color: [0.53, 0.74, 0.74] },
					{ id: '1', coord: 1, color: [0.63, 0.84, 0.82] }
				],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},

			// Background
			backgroundColor: {
				defaultValue: 0.0,
				gradient: [{ id: '0', coord: 0, color: [0.93, 0.97, 0.98] }]
			},

			// Persistance
			persistanceAmount: {
				defaultValue: 0,
				range: [0, 0.98]
			},

			// Camera
			cameraFov: { defaultValue: 0.6 },
			cameraPositionX: { defaultValue: -5 },
			cameraPositionY: { defaultValue: 4 },
			cameraPositionZ: { defaultValue: 5 }
		}
	)

	// Woofer
	controls.createPreset(
		'woofer',
		{
			label: 'Woofer'
		},
		{
			// Waveline
			wavelineShape: { defaultValue: 'Circle' },
			wavelineIntensity: { defaultValue: 2 },
			wavelineSize: { defaultValue: 1 },
			wavelinePositionZ: { defaultValue: 0 },
			wavelineRotationX: { defaultValue: -0.5 },
			wavelineDirection: { defaultValue: 'Perpendicular' },
			wavelineSymmetry: { defaultValue: 2 },
			wavelineThickness: { defaultValue: 10 },
			wavelineClones: { defaultValue: 24 },
			wavelineCloneSpacing: { defaultValue: 0.18 },
			wavelineFlowShape: {
				defaultValue: 1,
				signal: new Signal(
					'audio',
					'getVolumePeaked',
					audioAnalyzer.signalFunctions['getVolumePeaked'],
					[() => 0, () => 1]
				)
			},
			wavelineFlowColors: { defaultValue: 1 },
			wavelineColor: {
				defaultValue: 0.0,
				gradient: [
					{ id: '0', coord: 0, color: [0, 0, 0] },
					{ id: '0.5', coord: 0.5, color: [0.812, 0.004, 0.784] },
					{ id: '0.7', coord: 0.7, color: [0.929, 0.078, 1.0] },
					{ id: '0.75', coord: 0.75, color: [0.18, 1.0, 0.0] },
					{ id: '1', coord: 1, color: [0.0, 1.0, 0.914] }
				],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},

			// Background
			backgroundColor: {
				defaultValue: 0.0,
				gradient: [
					{ id: '0', coord: 0, color: [0, 0, 0] },
					{ id: '1.0', coord: 1.0, color: [1, 1, 1] }
				]
			},

			// Persistance
			persistanceAmount: {
				defaultValue: 0,
				range: [0.78, 0.98],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},
			persistanceScaleX: {
				defaultValue: 0,
				range: [-10, 200],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},
			persistanceScaleY: {
				defaultValue: 0,
				range: [-10, 200],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},
			persistanceTargetRadius: {
				defaultValue: 10,
				range: [0, 10]
			},
			persistanceTargetAngle: {
				defaultValue: 0.5,
				range: [-1, 1]
			},

			// Camera
			cameraFov: {
				defaultValue: 0.5,
				range: [0.55, 0.6],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'out',
						behaviour: 'straight'
					}
				)
			},
			cameraPositionX: { defaultValue: 0 },
			cameraPositionY: { defaultValue: 4 },
			cameraPositionZ: { defaultValue: 10 }
		}
	)

	// Kaleido
	controls.createPreset(
		'kaleido',
		{
			label: 'Kaleido'
		},
		{
			// Waveline
			wavelineIntensity: { defaultValue: 30 },
			wavelineThickness: {
				defaultValue: 0,
				range: [0, 15],
				signal: new Signal(
					'audio',
					'getBassVolume',
					audioAnalyzer.signalFunctions['getBassVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakBassVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},
			wavelineSize: {
				defaultValue: 3.5
			},
			wavelineResolution: { defaultValue: 2 },
			wavelineColor: {
				defaultValue: 0.0,
				gradient: [
					{ id: '0', coord: 0, color: [0.43, 0.16, 0.85] },
					{ id: '1', coord: 1, color: [0.52, 0.18, 0.97] }
				],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},

			// Background
			backgroundColor: {
				defaultValue: 0.0,
				gradient: [{ id: '0', coord: 0, color: [0.05, 0.05, 0.05] }]
			},

			// Persistance
			persistanceAmount: {
				defaultValue: 0,
				range: [0.78, 0.98],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'in',
						behaviour: 'straight'
					}
				)
			},
			persistanceScaleX: {
				defaultValue: 0,
				range: [0, -40],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'linear',
						behaviour: 'straight'
					}
				)
			},
			persistanceScaleY: {
				defaultValue: 0,
				range: [0, -40],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'linear',
						behaviour: 'straight'
					}
				)
			},
			persistanceRotation: {
				defaultValue: 0,
				range: [0, 1],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'linear',
						behaviour: 'straight'
					}
				)
			},
			persistanceTargetRadius: {
				defaultValue: 10,
				range: [0, 10]
			},

			// Kaleidoscope
			kaleidoscopeSegments: {
				defaultValue: 16,
				range: [0, 24]
			},
			kaleidoscopeLoops: {
				defaultValue: 2,
				range: [2, 2.2],
				signal: new Signal(
					'audio',
					'getBassVolume',
					audioAnalyzer.signalFunctions['getBassVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakBassVolume']],
					{
						ease: 'linear',
						behaviour: 'straight'
					}
				)
			},
			kaleidoscopeRadius: {
				defaultValue: 1,
				range: [0, 1],
				signal: new Signal(
					'audio',
					'getVolume',
					audioAnalyzer.signalFunctions['getVolume'],
					[() => 0, audioAnalyzer.signalFunctions['getPeakVolume']],
					{
						ease: 'out',
						behaviour: 'loop'
					}
				)
			}
		}
	)
</script>
