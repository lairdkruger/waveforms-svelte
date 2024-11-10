import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../library/signals/Signal.svelte'
import type { SignalContext } from './functions'

export type SignalId = string

export type SignalType = 'boolean' | 'number'
export type SignalBehaviour = 'straight' | 'loop' | 'pingpong'

export type Ticker = {
	value: number
}

export interface SignalConfig {
	ease: Ease
	behaviour: SignalBehaviour
	booster: Signal | undefined
}

export interface SerializedSignalConfig extends Omit<SignalConfig, 'booster'> {
	booster: SerializedSignalConfig | undefined
	// Also include id and context to enable function lookup on load
	id: SignalId
	context: SignalContext
}
