import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import Control from './Control'
import type { BooleanControlConfig, BooleanOutput, ControlId, ControlOptions } from './types'

export default class BooleanControl extends Control {
	output: Readable<BooleanOutput>
	config: Writable<BooleanControlConfig>

	constructor(id: ControlId, options: ControlOptions, config: BooleanControlConfig) {
		super('boolean', id, options, config)
		this.config = writable(config)
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	deriveOutput(config: BooleanControlConfig) {
		if (config.signal) {
			const output = config.signal?.function.output
			return get(output)
		}

		return () => config.defaultValue
	}
}
