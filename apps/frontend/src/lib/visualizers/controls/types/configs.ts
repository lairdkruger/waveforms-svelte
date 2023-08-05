import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../library/signals/Signal'
import type { SignalConfig } from './functions'
import type { ColorStop } from './primitives'
import type { SignalBehaviour } from './signals'

export interface BooleanControlConfig {
	defaultValue: 0 | 1
	signal: Signal | undefined
}

export interface NumberControlConfig {
	defaultValue: number
	range: [number, number]
	signal: Signal | undefined
	ease: Ease
	booster: SignalConfig | undefined
	behaviour: SignalBehaviour
}

export interface ColorControlConfig {
	defaultValue: number
	gradient: ColorStop[]
	signal: Signal | undefined
	ease: Ease
	booster: SignalConfig | undefined
	behaviour: SignalBehaviour
}

export interface SelectControlConfig {
	defaultValue: string
	signal: Signal | undefined
}

export type ControlConfig =
	| BooleanControlConfig
	| NumberControlConfig
	| ColorControlConfig
	| SelectControlConfig
