import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase'
import type {
	BooleanControlConfig,
	NumberOutput,
	ControlId,
	ControlOptions,
	SerializedControlConfig
} from '../../types'

export default class BooleanControl extends ControlBase {
	config: Writable<BooleanControlConfig>
	output: Readable<NumberOutput>

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		config?: Partial<BooleanControlConfig>
	) {
		super('boolean', id, options)

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
		function outputFunction() {
			if (!config.signal) return config.defaultValue

			const signalOutput = get(config.signal.output)()
			const output = signalOutput > 0.5 ? 1 : 0

			return output
		}

		return () => outputFunction()
	}

	extractConfig(): SerializedControlConfig {
		const signalConfig = get(this.config).signal?.extractConfig()
		const config = { ...get(this.config), signal: signalConfig }
		return config
	}
}
