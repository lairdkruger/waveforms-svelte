import type { Color } from './primitives'
import type { SignalType } from './signals'

export type SignalFunctionContext = 'audio' | 'midi'

export type AudioBooleanSignalFunctionId =
	| 'getVolumePeaked'
	| 'getBassPeaked'
	| 'getMidsPeaked'
	| 'getHighsPeaked'
export type AudioNumberSignalFunctionId =
	| 'getVolume'
	| 'getBassVolume'
	| 'getMidsVolume'
	| 'getHighsVolume'

export type BooleanSignalFunctionId = AudioBooleanSignalFunctionId | string
export type NumberSignalFunctionId = AudioNumberSignalFunctionId | string

export type SignalFunctionId = BooleanSignalFunctionId | NumberSignalFunctionId

export type BooleanOutput = () => 0 | 1
export type NumberOutput = () => number
export type ColorOutput = () => Color // Rgb
export type SelectOutput = () => string
export type ControlOutput = BooleanOutput | NumberOutput | ColorOutput | SelectOutput

export type Transformer = (value: number) => number

// Given to constructor functions
export interface SignalFunctionConfig {
	context: SignalFunctionContext
	type?: SignalType // Even though some signals (eg: midi) are always number signals, we should still use strict types for other signals wherever possible (eg: audio)
	id: SignalFunctionId
}

export interface SignalFunctionBase {
	context: SignalFunctionContext
	type?: SignalType // Even though some signals (eg: midi) are always number signals, we should still use strict types for other signals wherever possible (eg: audio)
}

export interface BooleanSignalFunction extends SignalFunctionBase {
	id: BooleanSignalFunctionId // eg: getVolumePeaked or get36_note_launchkeyMk261LaunchkeyMidi
	output: BooleanOutput
}

export interface NumberSignalFunction extends SignalFunctionBase {
	id: NumberSignalFunctionId // eg: getVolume or get36_control_launchkeyMk261LaunchkeyMidi
	output: NumberOutput // optional since often only set upon a signal being created by the controls store
}

export type SignalFunction = BooleanSignalFunction | NumberSignalFunction
