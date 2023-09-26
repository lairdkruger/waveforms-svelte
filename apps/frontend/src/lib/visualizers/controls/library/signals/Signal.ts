import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import type {
	NumberOutput,
	SerializedSignalConfig,
	SignalConfig,
	SignalContext,
	SignalId,
	SignalOutput
} from '../../types'
import { map, mapLoop } from '$lib/visualizers/utils/Maths'
import { clamp } from 'three/src/math/MathUtils'
import bezier, { getBezierValues } from '$lib/visualizers/utils/CubicBezier'

export default class Signal {
	context: SignalContext
	id: SignalId

	defaultFunction: NumberOutput
	range: [NumberOutput, NumberOutput]

	config: Writable<SignalConfig>
	output: Readable<SignalOutput>

	constructor(
		context: SignalContext,
		id: SignalId,
		defaultFunction: NumberOutput,
		range: [NumberOutput, NumberOutput],
		config?: Partial<SignalConfig>
	) {
		this.context = context
		this.id = id

		this.defaultFunction = defaultFunction
		this.range = range

		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	populateConfig(config?: Partial<SignalConfig>) {
		const defaultConfig: SignalConfig = {
			behaviour: 'straight',
			ease: 'linear',
			booster: undefined
		}

		return {
			...defaultConfig,
			...config
		}
	}

	deriveOutput(config: SignalConfig) {
		// All signal outputs are normalized to [0, 1] using provided range
		const normalizedOutput = clamp(
			map(this.defaultFunction(), this.range[0](), this.range[1](), 0, 1),
			0,
			1
		)

		// When signal is being boosted: it always returns 1
		const booster = config.booster
		const isBoosted = booster ? get(booster.output)() === 1 || normalizedOutput === 1 : false
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

	extractConfig(): SerializedSignalConfig {
		const config = { ...get(this.config), id: this.id, context: this.context }
		return { ...config, booster: config.booster?.extractConfig() }
	}
}
