import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase.svelte'
import type {
	ControlId,
	ControlOptions,
	NumberControlConfig,
	NumberControlSettings,
	NumberOutput,
	SerializedControlConfig
} from '../../types'
import { inRange, map } from '$lib/visualizers/utils/Maths'

export default class NumberControl extends ControlBase {
	settings: NumberControlSettings
	config: NumberControlConfig = $state(this.populateConfig())
	output: NumberOutput = $derived(this.deriveOutput(this.config))

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		settings?: Partial<NumberControlSettings>,
		config?: Partial<NumberControlConfig>
	) {
		super('number', id, options)

		this.settings = this.populateSettings(settings)
		this.config = this.populateConfig(config)
		// this.output = $derived(this.deriveOutput(this.config))
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

			const signalOutput = config.signal.output()
			const output = map(signalOutput, 0, 1, config.range[0], config.range[1])

			return this.settings.transformer ? this.settings.transformer(output) : output
		}

		return () => outputFunction()
	}

	setLowerRange(value: number) {
		this.config.range[0] = value

		// Revalidate default value
		if (!inRange(this.config.defaultValue, this.config.range[0], this.config.range[1])) {
			this.config.defaultValue = value
		}
	}

	setUpperRange(value: number) {
		this.config.range[1] = value

		// Revalidate default value
		if (!inRange(this.config.defaultValue, this.config.range[0], this.config.range[1])) {
			this.config.defaultValue = value
		}
	}

	setDefaultValue(value: number) {
		this.config.defaultValue = value

		// Revalidate range values
		if (this.config.range[0] < this.config.range[1]) {
			if (value > this.config.range[1]) {
				this.config.range[1] = this.config.defaultValue
			}
			if (value < this.config.range[0]) {
				this.config.range[0] = this.config.defaultValue
			}
		} else {
			if (value > this.config.range[0]) {
				this.config.range[0] = this.config.defaultValue
			}
			if (value < this.config.range[1]) {
				this.config.range[1] = this.config.defaultValue
			}
		}
	}

	extractConfig(): SerializedControlConfig {
		const signalConfig = this.config.signal?.extractConfig()
		const config = { ...this.config, signal: signalConfig }
		return config
	}
}
