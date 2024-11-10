import type { ControlConfig, SerializedControlConfig } from './configs'
import type { ControlId } from './controllers'

export type PresetId = string

export interface PresetOptions {
	label: string
}

export type PresetConfigs = Record<ControlId, Partial<ControlConfig>>

export type CurrentControlConfigs = Record<ControlId, SerializedControlConfig>
