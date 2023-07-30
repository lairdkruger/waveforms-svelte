import { derived, writable, type Readable, type Writable } from 'svelte/store'
import type { SignalFunctionConfig, SignalOutput } from './types'

export default class SignalFunction {
	config: Writable<SignalFunctionConfig>
	output: Readable<SignalOutput>

	constructor(config: SignalFunctionConfig) {
		const configDefaults = this.fillDefaults(config)
		this.config = writable(configDefaults)

		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	fillDefaults(config: SignalFunctionConfig) {
		const configDefaults: Partial<SignalFunctionConfig> = {
			behaviour: 'straight',
			ease: 'linear',
			booster: undefined
		}

		return {
			...configDefaults,
			...config
		}
	}

	deriveOutput(config: SignalFunctionConfig) {
		return config.defaultFunction
	}
}
