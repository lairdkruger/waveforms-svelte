import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import Control from './Control'
import type { BooleanControlConfig, BooleanOutput, ControlId, ControlOptions } from '../../types'

export default class BooleanControl extends Control {
	config: Writable<BooleanControlConfig>
	output: Readable<BooleanOutput>

	constructor(id: ControlId, options: ControlOptions, config?: Partial<BooleanControlConfig>) {
		super('boolean', id, options, config)

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
		if (config.signal) {
			const output = config.signal?.function.output
			return get(output)
		}

		return () => config.defaultValue
	}
}
