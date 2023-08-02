import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../library/signals/Signal'
import type { ColorStop } from './controllers'
import type { SignalFunctionConfig } from './functions'
import type { SignalBehaviour } from './signals'

export interface BooleanControlConfig {
	signal?: Signal
	defaultValue: 0 | 1
}

export interface NumberControlConfig {
	signal: Signal | undefined
	defaultValue: number
	range: [number, number]
	ease: Ease
	booster: SignalFunctionConfig | undefined
	behaviour: SignalBehaviour
}

export interface ColorControlConfig {
	signal: Signal | undefined
	defaultValue: number
	gradient: ColorStop[]
	ease: Ease
	booster: SignalFunctionConfig | undefined
	behaviour: SignalBehaviour
}

export interface SelectControlConfig {
	defaultValue: string
	values: string[]
}

export type ControlConfig =
	| BooleanControlConfig
	| NumberControlConfig
	| ColorControlConfig
	| SelectControlConfig
