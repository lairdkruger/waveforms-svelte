import ControlBase from './ControlBase.svelte'
import type {
	SelectControlConfig,
	SelectOutput,
	ControlId,
	ControlOptions,
	SelectControlSettings,
	SerializedControlConfig
} from '../../types'

export default class SelectControl extends ControlBase {
	settings: SelectControlSettings
	config: SelectControlConfig = $state(this.populateConfig())
	output: SelectOutput = $derived(this.deriveOutput(this.config))

	currentIndex: number
	debounce: boolean
	debouncer: () => void

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		settings?: Partial<SelectControlSettings>,
		config?: Partial<SelectControlConfig>
	) {
		super('select', id, options)

		this.settings = this.populateSettings(settings)
		this.config = this.populateConfig(config)
		// this.output = $derived(this.deriveOutput(this.config))

		this.currentIndex = 0
		this.debounce = false
		this.debouncer = () => {
			this.debounce = true
			setTimeout(() => {
				this.debounce = false
			}, 50)
		}
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
		const outputFunction = () => {
			if (!config.signal) return config.defaultValue

			const signalOutput = config.signal.output()
			const cycleOutput = signalOutput > 0.5

			// Cycle with debouncer
			if (cycleOutput && !this.debounce) {
				this.currentIndex = (this.currentIndex + 1) % this.settings.values.length
				this.debouncer()
			}

			return this.settings.values[this.currentIndex]
		}

		return () => outputFunction()
	}

	extractConfig(): SerializedControlConfig {
		const signalConfig = this.config.signal?.extractConfig()
		const config = { ...this.config, signal: signalConfig }
		return config
	}
}
