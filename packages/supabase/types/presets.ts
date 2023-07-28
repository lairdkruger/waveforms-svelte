// Copy from generate.ts
import { Json } from './generated'

export interface Preset {
	id: string
	midi_binding: string | null
	name: string
	schema: Json
	user_id: string
	visualizer_id: string
}
