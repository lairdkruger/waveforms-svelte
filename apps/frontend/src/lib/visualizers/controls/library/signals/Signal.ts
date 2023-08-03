import SignalFunction from './SignalFunction'
import type { SignalFunctionConfig } from '../../types'

export default class Signal {
	id
	function

	constructor(config: Partial<SignalFunctionConfig>) {
		this.id = config.id
		this.function = new SignalFunction(config)
	}
}
