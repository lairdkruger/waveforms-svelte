import type { Control } from './controllers'

export type PresetId = string

export interface Preset {
	id: PresetId
	name: string
	controls: Record<string, Control>
	midiBinding: string | null
}
