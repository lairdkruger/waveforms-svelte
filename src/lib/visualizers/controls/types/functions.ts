import type { Color } from './primitives'

export type SignalContext = 'audio' | 'midi'

export type NumberOutput = () => number
export type ColorOutput = () => Color // Rgb
export type SelectOutput = () => string
export type SignalOutput = NumberOutput
export type ControlOutput = NumberOutput | ColorOutput | SelectOutput

export type Transformer = (value: number) => number
