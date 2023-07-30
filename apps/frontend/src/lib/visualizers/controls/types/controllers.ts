import type BooleanControl from '../library/controls/BooleanControl'
import type NumberControl from '../library/controls/NumberControl'
import type { BooleanOutput, ColorOutput, NumberOutput, SelectOutput } from './functions'
import type { BooleanSignal, NumberSignal } from './signals'

// Controller types
export type ControlType = 'boolean' | 'number' | 'color' | 'select'
export type ControlId = string

export interface ControlGeneric {
	id: ControlId
	type: ControlType
	label: string
	folder?: string
	group?: string
}

// export interface BooleanControl extends ControlGeneric {
// 	type: 'boolean'
// 	output: BooleanOutput
// 	defaultValue: 1 | 0
// 	signal?: BooleanSignal
// }

// Settings are fixed and set by the visualizer (not the user)
export type NumberControlSettings = {
	rangeReadOnly?: boolean // Disable user editing of range
	transformer?: Transformer
}

// export interface NumberControl extends ControlGeneric {
// 	type: 'number'
// 	output: NumberOutput
// 	defaultValue: number
// 	range: [number, number]
// 	settings?: NumberControlSettings
// 	signal?: NumberSignal | BooleanSignal
// }

export type ColorStop = {
	id?: string
	coord: number // Position on gradient [0...1]
	color: [number, number, number] // [R, G, B]
}

// export interface ColorControl extends ControlGeneric {
// 	type: 'color'
// 	output: ColorOutput
// 	defaultValue: number
// 	gradient: ColorStop[]
// 	signal?: NumberSignal | BooleanSignal
// }

// export interface SelectControl extends ControlGeneric {
// 	type: 'select'
// 	output: SelectOutput
// 	defaultValue: string
// 	values: string[]
// }

// export type Control = BooleanControl | NumberControl | ColorControl | SelectControl
export type Control = BooleanControl | NumberControl
