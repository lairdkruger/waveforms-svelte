import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../library/signals/Signal'
import type { Color } from './primitives'
import type { SignalBehaviour } from './signals'

export type SignalContext = 'audio' | 'midi'

export type NumberOutput = () => number
export type ColorOutput = () => Color // Rgb
export type SelectOutput = () => string
export type SignalOutput = NumberOutput
export type ControlOutput = NumberOutput | ColorOutput | SelectOutput

export type Transformer = (value: number) => number

// Given to constructor functions
export interface SignalConfig {
	behaviour: SignalBehaviour
	ease: Ease
	booster: Signal | undefined
}
