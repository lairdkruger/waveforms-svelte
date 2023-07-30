import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type {
	BooleanSignalFunction,
	NumberSignalFunction,
	SignalFunctionContext
} from './functions'

export type SignalId = string

export type SignalType = 'boolean' | 'number'
export type SignalBehaviour = 'straight' | 'loop'

export interface SignalGeneric {
	type: SignalType
}

export interface BooleanSignal extends SignalGeneric {
	id: SignalId
	type: 'boolean'
	function: BooleanSignalFunction
}

export interface NumberSignal extends SignalGeneric {
	id: SignalId
	type: 'number'
	function: NumberSignalFunction
	ease: Ease
	booster?: BooleanSignal // Signals can be boosted by boolean signals
	behaviour: SignalBehaviour // Looped signals continuously grow
}

export type Signal = BooleanSignal | NumberSignal
