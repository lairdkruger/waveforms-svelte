import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../library/signals/Signal'

export type SignalId = string

export type SignalType = 'boolean' | 'number'
export type SignalBehaviour = 'straight' | 'loop'

export interface SignalConfig {
	ease: Ease
	behaviour: SignalBehaviour
	booster: Signal | undefined
}
