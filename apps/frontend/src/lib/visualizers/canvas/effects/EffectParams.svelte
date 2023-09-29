<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import Signal from '$lib/visualizers/controls/library/signals/Signal'
	import { clamp } from '$lib/visualizers/utils/Maths'

	const { effects, onFrame } = getWebglContext()
	const { controls, audioAnalyzer } = getVisualizerContext()

	const folder = controls.createFolder('effects', { label: 'Effects' })
	const group = controls.createGroup('frames', { label: 'Frames', folder: folder })

	const persistance = controls.createNumberControl(
		'persistance',
		{ label: 'Persistance', group: group },
		{
			defaultValue: 0,
			range: [0.8, 1],
			signal: new Signal(
				'audio',
				'getVolume',
				audioAnalyzer.signalFunctions['getVolume'],
				[() => 0, () => audioAnalyzer.signalFunctions['getPeakVolume']()], // TODO
				{
					ease: 'in',
					booster: new Signal(
						'audio',
						'getVolumePeaked',
						audioAnalyzer.signalFunctions['getVolumePeaked'],
						[() => 0, () => 1]
					)
				}
			)
		},
		{
			transformer: (value) => clamp(value, 0, 1)
		}
	)

	onFrame(() => {
		if ($effects) {
			$effects.uniforms.amount.value = $persistance()
		}
	})
</script>
