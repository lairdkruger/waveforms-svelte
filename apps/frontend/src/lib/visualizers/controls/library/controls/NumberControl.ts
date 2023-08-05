import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase'
import type {
	ControlId,
	ControlOptions,
	NumberControlConfig,
	NumberControlSettings,
	NumberOutput
} from '../../types'
import { map } from '$lib/visualizers/utils/Maths'

export default class NumberControl extends ControlBase {
	config: Writable<NumberControlConfig>
	settings: NumberControlSettings
	output: Readable<NumberOutput>

	constructor(
		id: ControlId,
		options: Partial<ControlOptions>,
		config?: Partial<NumberControlConfig>,
		settings?: NumberControlSettings
	) {
		super('number', id, options)

		this.settings = this.populateSettings(settings)
		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	populateSettings(settings?: NumberControlSettings) {
		const defaultSettings: NumberControlSettings = {
			rangeReadOnly: false,
			transformer: undefined
		}

		return { ...defaultSettings, ...settings }
	}

	populateConfig(config?: Partial<NumberControlConfig>) {
		const defaultConfig: NumberControlConfig = {
			signal: undefined,
			defaultValue: 1,
			range: [1, 2],
			ease: 'in',
			behaviour: 'straight',
			booster: undefined
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: NumberControlConfig) {
		function outputFunction() {
			if (!config.signal) return config.defaultValue

			const signalOutput = get(config.signal.function.output)()
			const output = map(signalOutput, 0, 1, config.range[0], config.range[1])

			return output
		}

		return () => outputFunction()
	}

	setLowerRange(value: number) {
		this.config.update((config) => {
			config.range[0] = value

			if (config.defaultValue < value) {
				config.defaultValue = value
			}

			return config
		})
	}

	setUpperRange(value: number) {
		this.config.update((config) => {
			config.range[1] = value

			if (config.defaultValue > value) {
				config.defaultValue = value
			}

			return config
		})
	}

	setDefaultValue(value: number) {
		this.config.update((config) => {
			config.defaultValue = value

			// Revalidate range values
			if (value > config.range[1]) {
				config.range[1] = config.defaultValue
			}

			if (value < config.range[0]) {
				config.range[0] = config.defaultValue
			}

			return config
		})
	}
}
