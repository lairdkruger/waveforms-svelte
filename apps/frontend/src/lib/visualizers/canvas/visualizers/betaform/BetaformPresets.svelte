<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import Signal from '$lib/visualizers/controls/library/signals/Signal'

	const { controls, audioAnalyzer } = getVisualizerContext()

	controls.createPreset(
		'preset1',
		{
			label: 'Preset 1'
		},
		{
			// Waveline
			lineIntensity: { defaultValue: 30 },
			lineThickness: {
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
			lineSize: {
				defaultValue: 3.5
			},
			lineResolution: { defaultValue: 2 },
			lineColor: {
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
