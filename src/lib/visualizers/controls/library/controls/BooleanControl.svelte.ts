import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import ControlBase from './ControlBase.svelte'
import type {
	BooleanControlConfig,
	NumberOutput,
	ControlId,
	ControlOptions,
	SerializedControlConfig
} from '../../types'

export default class BooleanControl extends ControlBase {
	config: BooleanControlConfig = $state(this.populateConfig())
	output: NumberOutput = $derived(this.deriveOutput(this.config))

	constructor(
		id: ControlId,
		options?: Partial<ControlOptions>,
		config?: Partial<BooleanControlConfig>
	) {
		super('boolean', id, options)

		this.config = this.populateConfig(config)
		// this.output = $derived(this.deriveOutput(this.config))
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

			const signalOutput = config.signal.output()
			const output = signalOutput > 0.5 ? 1 : 0

			return output
		}

		return () => outputFunction()
	}

	extractConfig(): SerializedControlConfig {
		const signalConfig = this.config.signal?.extractConfig()
		const config = { ...this.config, signal: signalConfig }
		return config
	}
}
