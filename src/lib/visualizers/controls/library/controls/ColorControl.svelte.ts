import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase.svelte'
import type {
	ControlId,
	ControlOptions,
	ColorControlConfig,
	ColorOutput,
	ColorStop,
	SerializedControlConfig
} from '../../types'
import { closest2, lerpColors, map } from '$lib/visualizers/utils/Maths'

export default class ColorControl extends ControlBase {
	config: ColorControlConfig = $state(this.populateConfig())
	output: ColorOutput = $derived(this.deriveOutput(this.config))

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		config?: Partial<ColorControlConfig>
	) {
		super('color', id, options)

		this.config = this.populateConfig(config)
		// this.output = $derived(this.deriveOutput(this.config))

		// Force ordering of gradient on any changes
		$effect(() => {
			this.config.gradient = this.config.gradient.sort((a, b) => a.coord - b.coord)
		})
	}

	populateConfig(config?: Partial<ColorControlConfig>) {
		const defaultConfig: ColorControlConfig = {
			signal: undefined,
			defaultValue: 1,
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{ id: '1', coord: 1, color: [1, 1, 1] }
			]
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: ColorControlConfig): ColorOutput {
		function outputFunction() {
			const mixAmount = config.signal ? config.signal.output() : config.defaultValue

			// Get and return the two colors whose mix amounts are closest to the current mix amount
			function getColorsMix(mix: number, gradient: ColorStop[]): [ColorStop, ColorStop] {
				const colorIndexes = gradient.map((color) => color.coord)

				// If gradient is single color, just return that color
				if (gradient.length <= 1) return [gradient[0], gradient[0]]

				const closest = closest2(mix, colorIndexes)
				return [gradient[closest[0]], gradient[closest[1]]]
			}

			const colors = getColorsMix(mixAmount, config.gradient)
			const edgeColor = colors[0].color === colors[1].color

			// Normalize mix so it goes from [0...1] between the two colors indexes (indexes)
			const normalizedMix = map(mixAmount, colors[0].coord, colors[1].coord, 0, 1)
			const color = edgeColor
				? colors[0].color
				: lerpColors([colors[0].color, colors[1].color], normalizedMix)

			return color
		}

		// Call mix function once
		return () => outputFunction()
	}

	extractConfig(): SerializedControlConfig {
		const signalConfig = this.config.signal?.extractConfig()
		const config = { ...this.config, signal: signalConfig }
		return config
	}
}
