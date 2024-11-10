import type BooleanControl from '../library/controls/BooleanControl.svelte'
import type ColorControl from '../library/controls/ColorControl.svelte'
import type NumberControl from '../library/controls/NumberControl.svelte'
import type SelectControl from '../library/controls/SelectControl.svelte'
import type { Transformer } from './functions'

// Controller types
export type ControlType = 'boolean' | 'number' | 'color' | 'select'
export type ControlId = string

// Settings are fixed and set by the visualizer (not the user)
export type NumberControlSettings = {
	rangeReadOnly?: boolean // Disable user editing of range
	transformer?: Transformer
}

export type SelectControlSettings = {
	values: string[]
}

// export type Control = BooleanControl | NumberControl | ColorControl | SelectControl
export type Control = BooleanControl | NumberControl | SelectControl | ColorControl
