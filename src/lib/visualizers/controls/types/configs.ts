import type Signal from '../library/signals/Signal.svelte'
import type { ColorStop } from './primitives'
import type { SerializedSignalConfig } from './signals'

export interface BooleanControlConfig {
	defaultValue: 0 | 1
	signal: Signal | undefined
}

export interface NumberControlConfig {
	defaultValue: number
	range: [number, number]
	signal: Signal | undefined
}

export interface ColorControlConfig {
	defaultValue: number
	gradient: ColorStop[]
	signal: Signal | undefined
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

export interface SerializedControlConfig extends Omit<ControlConfig, 'signal'> {
	signal: SerializedSignalConfig | undefined
}
