import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import Control from './Control'
import type { BooleanControlConfig, BooleanOutput, ControlId, ControlOptions } from '../../types'

export default class BooleanControl extends Control {
	config: Writable<BooleanControlConfig>
	output: Readable<BooleanOutput>

	constructor(id: ControlId, options: ControlOptions, config?: Partial<BooleanControlConfig>) {
		super('boolean', id, options)

		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	populateConfig(config?: Partial<BooleanControlConfig>) {
		const defaultConfig: BooleanControlConfig = {
			defaultValue: 1,
			signal: undefined
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: BooleanControlConfig) {
		function outputFunction() {
			if (!config.signal) return config.defaultValue

			const signalOutput = get(config.signal.function.output)()
			const output = signalOutput > 0.5 ? 1 : 0

			return output
		}

		return () => outputFunction()
	}
}
