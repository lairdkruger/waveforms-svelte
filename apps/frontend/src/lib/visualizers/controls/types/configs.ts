import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../library/signals/Signal'
import type { ColorStop } from './controllers'
import type { SignalFunctionConfig } from './functions'
import type { SignalBehaviour } from './signals'

export interface BooleanControlConfig {
	signal: Signal | undefined
	defaultValue: 0 | 1
}

export interface NumberControlConfig {
	defaultValue: number
	range: [number, number]
	signal: Signal | undefined
	ease: Ease
	booster: SignalFunctionConfig | undefined
	behaviour: SignalBehaviour
}

export interface ColorControlConfig {
	defaultValue: number
	gradient: ColorStop[]
	signal: Signal | undefined
	ease: Ease
	booster: SignalFunctionConfig | undefined
	behaviour: SignalBehaviour
}

export interface SelectControlConfig {
	defaultValue: string
	values: string[]
	signal: Signal | undefined
}

export type ControlConfig =
	| BooleanControlConfig
	| NumberControlConfig
	| ColorControlConfig
	| SelectControlConfig
