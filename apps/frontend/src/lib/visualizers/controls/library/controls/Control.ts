import { writable, type Readable, type Writable, derived } from 'svelte/store'
import type {
	ControlConfig,
	ControlId,
	ControlOptions,
	ControlOutput,
	ControlType
} from '../../types'

export default class Control {
	type
	id
	options
	config: Writable<ControlConfig>
	output: Readable<ControlOutput>

	constructor(type: ControlType, id: ControlId, options: ControlOptions, config?: ControlConfig) {
		this.type = type
		this.id = id

		const populatedOptions = this.populateOptions(options)
		this.options = populatedOptions

		this.config = writable(config)
		this.output = derived(this.config, ($config) => () => $config.defaultValue)
	}

	populateOptions(options: ControlOptions) {
		const defaultOptions: Partial<ControlOptions> = {
			label: this.id
		}

		return { ...defaultOptions, ...options }
	}
}
