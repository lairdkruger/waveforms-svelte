import { derived, writable, type Readable, type Writable } from 'svelte/store'
import type { SignalFunctionConfig, SignalOutput } from './types'

export default class SignalFunction {
	config: Writable<SignalFunctionConfig>
	output: Readable<SignalOutput>

	constructor(config: SignalFunctionConfig) {
		this.config = writable(config)
		this.output = derived(this.config, ($config) => this.deriveOutput($config))
	}

	deriveOutput(config: SignalFunctionConfig) {
		return config.defaultFunction
	}
}
