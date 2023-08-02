import { derived, writable, type Readable, type Writable } from 'svelte/store'
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
			values: ['default']
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: SelectControlConfig) {
		return () => config.defaultValue
	}
}
