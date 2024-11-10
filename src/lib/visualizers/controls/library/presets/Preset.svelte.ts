import { writable, type Writable } from 'svelte/store'
import type { PresetConfigs, PresetId, PresetOptions } from '../../types/presets'
import type { MidiControlId } from '$lib/visualizers/midi/Midi'

export default class Preset {
	id
	options
	configs: PresetConfigs
	midiBinding: MidiControlId | null = $state(null)

	constructor(
		id: PresetId,
		options: Partial<PresetOptions>,
		configs: PresetConfigs,
		midiBinding?: MidiControlId | null
	) {
		this.id = id

		const populatedOptions = this.populateOptions(options)
		this.options = populatedOptions

		this.configs = configs

		this.midiBinding = midiBinding ?? null
	}

	populateOptions(options: Partial<PresetOptions>) {
		const defaultOptions: PresetOptions = {
			label: 'Preset'
		}

		return { ...defaultOptions, ...options }
	}
}
