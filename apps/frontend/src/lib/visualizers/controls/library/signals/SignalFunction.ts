import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import type { SignalFunctionConfig, SignalOutput } from '../../types'
import { map, mapLoop } from '$lib/visualizers/utils/Maths'
import { clamp } from 'three/src/math/MathUtils'
import bezier, { getBezierValues } from '$lib/visualizers/utils/CubicBezier'

export default class SignalFunction {
	config: Writable<SignalFunctionConfig>
	output: Readable<SignalOutput>

	constructor(config: Partial<SignalFunctionConfig>) {
		const configDefaults = this.fillDefaults(config)
		this.config = writable(configDefaults)

		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	fillDefaults(config: Partial<SignalFunctionConfig>) {
		const configDefaults: SignalFunctionConfig = {
			context: 'audio',
			id: 'getVolume',
			defaultFunction: () => 1,
			range: [() => 0, () => 1],
			behaviour: 'straight',
			ease: 'linear',
			booster: undefined
		}

		return {
			...configDefaults,
			...config
		}
	}

	deriveOutput(config: SignalFunctionConfig) {
		// All signal outputs are normalized to [0, 1] using provided range
		const normalizedOutput = clamp(
			map(config.defaultFunction(), config.range[0](), config.range[1](), 0, 1),
			0,
			1
		)

		// When signal is being boosted: it always returns 1
		const isBoosted = config.booster && normalizedOutput === 1
		if (isBoosted) return () => 1

		// Bezier curves
		const bezierValues = getBezierValues(config.ease)
		const bezierMap = bezier(bezierValues)

		// Return blend value [0 ... 1] either bezier mapped value, or just normalized value
		const mixAmount = bezierMap(normalizedOutput)

		// Handle behaviours
		let output = mixAmount

		if (config.behaviour === 'straight') {
			return () => output
		} else if (config.behaviour === 'loop') {
			// Looping behaviour
			// Map bezier value to speed range
			const minSpeed = 0.1 // Always moving for colors
			const maxSpeed = 2
			const speedValue = map(mixAmount, 0, 1, minSpeed, maxSpeed)

			// Use speed value as speed for looping (ping pong)
			const loopValue = mapLoop(speedValue)

			output = loopValue
		}

		return () => output
	}
}
