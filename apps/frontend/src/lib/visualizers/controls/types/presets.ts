import type { ControlConfig } from './configs'
import type { ControlId } from './controllers'

export type PresetId = string

export interface PresetOptions {
	label: string
}

export type PresetConfigs = Record<ControlId, Partial<ControlConfig>>
