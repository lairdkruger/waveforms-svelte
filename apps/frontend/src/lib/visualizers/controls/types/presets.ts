import type { ControlConfig, SerializedControlConfig } from './configs'
import type { ControlId } from './controllers'
import type { SignalConfig } from './signals'

export type PresetId = string

export interface PresetOptions {
	label: string
}

export type PresetConfigs = Record<ControlId, Partial<ControlConfig>>

export type CurrentControlConfigs = Record<ControlId, SerializedControlConfig>
