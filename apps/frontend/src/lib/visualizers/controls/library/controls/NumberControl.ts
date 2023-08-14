import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase'
import type {
	ControlId,
	ControlOptions,
	NumberControlConfig,
	NumberControlSettings,
	NumberOutput,
	SerializedControlConfig
} from '../../types'
import { map } from '$lib/visualizers/utils/Maths'

export default class NumberControl extends ControlBase {
	settings: NumberControlSettings
	config: Writable<NumberControlConfig>
	output: Readable<NumberOutput>

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		settings?: Partial<NumberControlSettings>,
		config?: Partial<NumberControlConfig>
	) {
		super('number', id, options)

		this.settings = this.populateSettings(settings)
		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	populateSettings(settings?: Partial<NumberControlSettings>) {
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
			range: [0, 2]
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: NumberControlConfig) {
		const outputFunction = () => {
			if (!config.signal)
				return this.settings.transformer
					? this.settings.transformer(config.defaultValue)
					: config.defaultValue

			const signalOutput = get(config.signal.output)()
			const output = map(signalOutput, 0, 1, config.range[0], config.range[1])

			return this.settings.transformer ? this.settings.transformer(output) : output
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

	extractConfig(): SerializedControlConfig {
		const signalConfig = get(this.config).signal?.extractConfig()
		const config = { ...get(this.config), signal: signalConfig }
		return config
	}
}
