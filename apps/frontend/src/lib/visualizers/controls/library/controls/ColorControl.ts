import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import Control from './Control'
import type {
	ControlId,
	ControlOptions,
	ColorControlConfig,
	ColorOutput,
	ColorStop
} from '../../types'
import { closest2, lerpColors, map, mapLoop } from '$lib/visualizers/utils/Maths'
import bezier, { getBezierValues } from '$lib/visualizers/utils/CubicBezier'

export default class ColorControl extends Control {
	config: Writable<ColorControlConfig>
	output: Readable<ColorOutput>

	constructor(id: ControlId, options: ControlOptions, config?: Partial<ColorControlConfig>) {
		super('color', id, options)

		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))

		// Force ordering of gradient on any changes
		this.config.subscribe((config) => {
			config.gradient = config.gradient.sort((a, b) => a.coord - b.coord)
		})
	}

	populateConfig(config?: Partial<ColorControlConfig>) {
		const defaultConfig: ColorControlConfig = {
			signal: undefined,
			defaultValue: 1,
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{ id: '1', coord: 1, color: [1, 1, 1] }
			],
			ease: 'in',
			behaviour: 'straight',
			booster: undefined
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: ColorControlConfig): ColorOutput {
		function mixAmountFunction() {
			// Escape here if function is not a signal function
			if (!config.signal) return config.defaultValue

			const signalConfig = get(config.signal.function.config)

			// Return either volume, bass, mids or highs peak volume to use for more accurate mapping
			const peakValue = () => {
				if (signalConfig.context === 'audio') {
					// if (config.signal?.id === 'getVolume') return getPeakVolume()
					// if (config.signal?.id === 'getBassVolume') return getPeakBassVolume()
					// if (config.signal?.id === 'getMidsVolume') return getPeakMidsVolume()
					// if (config.signal?.id === 'getHighsVolume') return getPeakHighsVolume()
					// return getPeakVolume()
					return 1
				} else {
					// At the moment, all other inputs (midi etc) just range from 0-1
					return 1
				}
			}

			// When signal is being boosted: it always return its max value
			const isBoosted = signalConfig.booster && get(signalConfig.booster.function.output)()

			// Normalize various signal inputs to [0, 1]
			const normalizedValue = map(get(config.signal.function.output)(), 0, peakValue(), 0, 1)

			const bezierValues = signalConfig.ease ? getBezierValues(signalConfig.ease) : undefined
			const bezierMap = bezierValues ? bezier(bezierValues) : null

			// Return blend value [0 ... 1] either bezier mapped value, or just normalized value
			const mixAmount = bezierMap ? bezierMap(normalizedValue) : normalizedValue

			// Handle behaviours
			const loopingBehaviour = signalConfig.behaviour && signalConfig.behaviour === 'loop'

			let outputValue: number = 0

			if (!loopingBehaviour) {
				// Straight behaviour
				outputValue = mixAmount
			} else {
				// Looping behaviour
				// Map bezier value to speed range
				const minSpeed = 0.1 // Always moving for colors
				const maxSpeed = 2
				const speedValue = map(mixAmount, 0, 1, minSpeed, maxSpeed)

				// Use speed value as speed for looping (ping pong)
				const loopValue = mapLoop(speedValue)

				outputValue = loopValue
			}

			return outputValue
		}

		function outputFunction(mix: () => number) {
			const mixAmount = mix()

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
		const mix = () => mixAmountFunction()
		return () => outputFunction(mix)
	}
}
