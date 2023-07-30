import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type Signal from '../Signal'
import type { ColorStop } from './controllers'
import type { SignalFunctionConfig } from './functions'
import type { SignalBehaviour } from './signals'

export interface BooleanControlConfig {
	signal?: Signal
	defaultValue: 0 | 1
}

export interface NumberControlConfig {
	signalFunctionConfig?: SignalFunctionConfig
	defaultValue?: number
	range?: [number, number]
	ease?: Ease
	booster?: SignalFunctionConfig
	behaviour?: SignalBehaviour
}

export interface ColorControlConfig {
	signalFunctionConfig?: SignalFunctionConfig
	defaultValue?: number
	gradient?: ColorStop[]
	ease?: Ease
	booster?: SignalFunctionConfig
	behaviour?: SignalBehaviour
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
