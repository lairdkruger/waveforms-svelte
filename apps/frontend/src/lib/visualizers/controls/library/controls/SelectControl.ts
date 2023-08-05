import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase'
import type {
	SelectControlConfig,
	SelectOutput,
	ControlId,
	ControlOptions,
	SelectControlSettings
} from '../../types'

export default class SelectControl extends ControlBase {
	settings: SelectControlSettings
	config: Writable<SelectControlConfig>
	output: Readable<SelectOutput>

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		settings?: Partial<SelectControlSettings>,
		config?: Partial<SelectControlConfig>
	) {
		super('select', id, options)

		this.settings = this.populateSettings(settings)
		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	populateSettings(settings?: Partial<SelectControlSettings>) {
		const defaultSettings: SelectControlSettings = {
			values: ['Default']
		}

		return { ...defaultSettings, ...settings }
	}

	populateConfig(config?: Partial<SelectControlConfig>) {
		const defaultConfig: SelectControlConfig = {
			defaultValue: 'default',
			signal: undefined
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: SelectControlConfig) {
		let currentIndex = this.settings.values.indexOf(config.defaultValue)

		const outputFunction = () => {
			if (!config.signal) return config.defaultValue

			const signalOutput = get(config.signal.function.output)()
			const cycleOutput = signalOutput > 0.5
			if (cycleOutput) currentIndex = (currentIndex + 1) % this.settings.values.length

			return this.settings.values[currentIndex]
		}

		return () => outputFunction()
	}
}
