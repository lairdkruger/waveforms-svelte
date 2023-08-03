import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import Control from './Control'
import type { SelectControlConfig, SelectOutput, ControlId, ControlOptions } from '../../types'

export default class SelectControl extends Control {
	config: Writable<SelectControlConfig>
	output: Readable<SelectOutput>

	constructor(id: ControlId, options: ControlOptions, config?: Partial<SelectControlConfig>) {
		super('select', id, options)

		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	populateConfig(config?: Partial<SelectControlConfig>) {
		const defaultConfig: SelectControlConfig = {
			defaultValue: 'default',
			values: ['default'],
			signal: undefined
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: SelectControlConfig) {
		let currentIndex = config.values.indexOf(config.defaultValue)

		function outputFunction() {
			if (!config.signal) return config.defaultValue

			const signalOutput = get(config.signal.function.output)()
			const cycleOutput = signalOutput > 0.5
			if (cycleOutput) currentIndex = (currentIndex + 1) % config.values.length

			return config.values[currentIndex]
		}

		return () => outputFunction()
	}
}
