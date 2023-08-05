import type AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
import type Midi from '$lib/visualizers/midi/Midi'
import type {
	Control,
	ControlId,
	Controls as ControlsState,
	NumberOutput,
	ColorOutput,
	SelectOutput,
	FolderOptions,
	Folder,
	GroupOptions,
	Group,
	ControlOptions,
	Presets,
	BooleanControlConfig,
	NumberControlConfig,
	NumberControlSettings,
	SelectControlConfig,
	ColorControlConfig,
	SelectControlSettings,
	ControlConfig
} from './types'
import type { Preset as PresetDb } from 'supabase'
import type { PresetConfigs, PresetId, PresetOptions } from './types/presets'
import { deepClone } from '$lib/visualizers/utils/Objects'
import { deepmerge } from 'deepmerge-ts'
import { writable, type Readable, type Writable, get } from 'svelte/store'
import BooleanControl from './library/controls/BooleanControl'
import type Signal from './library/signals/Signal'
import NumberControl from './library/controls/NumberControl'
import SelectControl from './library/controls/SelectControl'
import ColorControl from './library/controls/ColorControl'
import Preset from './library/presets/Preset'

export default class Controls {
	// Internals
	visualizerSlug: string
	userPresets: PresetDb[] | null
	_clientStateReady = false

	// States (shared variables that require reactivity)
	draggedSignal: Writable<Signal | null> = writable(null)
	draggedSignalTarget: Writable<Control | null> = writable(null)
	controlPanelRef: Writable<HTMLDivElement | null> = writable(null)
	dragStartCoord: Writable<[number, number]> = writable([0, 0])

	audioAnalyzer: AudioAnalyzer
	midi: Midi

	controls: ControlsState = {
		folders: {},
		groups: {},
		controls: {}
	}

	presets: Presets = {
		preset: 'default',
		presets: {
			default: new Preset('default', { label: 'Default' }, {}, null)
		}
	}

	constructor(
		visualizerSlug: string,
		userPresets: PresetDb[] | null,
		audioAnalyzer: AudioAnalyzer,
		midi: Midi
	) {
		this.visualizerSlug = visualizerSlug
		this.userPresets = userPresets
		this.audioAnalyzer = audioAnalyzer
		this.midi = midi
	}

	///////////////////////////////////////////////
	// Internal Actions
	///////////////////////////////////////////////
	setClientStateReady(value: boolean) {
		// This function is always called last so we can assume that the store is ready for user data
		// Load userPresets into controls state if exists
		if (this.userPresets) {
			for (const userPreset of this.userPresets) {
				this.loadUserPreset(userPreset)
			}
		}

		this._clientStateReady = value
	}

	///////////////////////////////////////////////
	// Utility Functions
	///////////////////////////////////////////////
	resetInteractions() {
		this.draggedSignal.set(null)
		this.draggedSignalTarget.set(null)
	}

	// Fetch signal function object from specified context
	// Basically double checks if the proposed signal function actually exists in the audio or midi signal functions
	// Returned Signals must have working output functions (these should already be set by the corresponding store)
	// getSignalFunction(signal: Signal) {
	// 	if (signal.context === 'audio') {
	// 		const audioSignal = this.audioAnalyzer.signals[signal.id]
	// 		if (audioSignal) return audioSignal
	// 	}

	// 	if (signal.context === 'midi') {
	// 		const midiSignal = this.midi[signal.id]

	// 		if (!midiSignal) {
	// 			// If midi function doesn't exist, we need to create one
	// 			const midiSignal = this.midi.createMidiSignal(signalFunctionConfig.id)
	// 			return midiSignal
	// 		}

	// 		return midiSignal
	// 	}

	// 	// Fallback to null, usually means audio or midi contexts weren't ready
	// 	return null
	// }

	// createSignalId(controlId: ControlId, signalId = 'main') {
	// 	return `${controlId}_signal_${signalId}`
	// }

	// createBoosterSignal(controlId: ControlId, signalFunctionConfig: SignalConfig) {
	// 	const signalFunction = this.getSignal(signalFunctionConfig)
	// 	if (!signalFunction) return null

	// 	const signal = {
	// 		id: this.createSignalId(controlId, 'booster'),
	// 		type: 'boolean',
	// 		function: signalFunction
	// 	}

	// 	return signal
	// }

	///////////////////////////////////////////////
	// Constructor Functions
	///////////////////////////////////////////////
	// Create empty folder, return id
	createFolder(id: string, options?: FolderOptions) {
		if (this.controls.folders[id]) return id // Escape if already exists

		const folder: Folder = {
			id: id,
			label: options?.label ?? id
		}

		// Add to controls store
		this.controls.folders[id] = folder

		return id
	}

	// Create empty group, return key
	createGroup(id: string, options?: GroupOptions) {
		if (this.controls.groups[id]) return id // Escape if already exists

		// Which folder this group belongs
		const folderId = options?.folder ?? id

		// If folder doesn't exist: create one first
		if (!this.controls.folders[id]) {
			this.createFolder(folderId, { label: options?.label ?? folderId })
		}

		const group: Group = {
			id: id,
			label: options?.label ?? id,
			folder: folderId
		}

		// Add to controls store
		this.controls.groups[id] = group

		return id
	}

	// Creates groups & folders if they don't already exist
	createStructure(id: string, options?: Partial<ControlOptions>) {
		const folderId = options?.folder ?? id
		const groupId = options?.group ?? id

		// Returners
		let folder = folderId
		let group = groupId

		// If group doesn't exist: create one first
		if (!this.controls.groups[groupId]) {
			group = this.createGroup(groupId, {
				label: options?.label ?? groupId,
				folder: folderId
			})

			// If folder doesn't exist: create one first
			if (!this.controls.folders[folderId]) {
				folder = this.createFolder(folderId, { label: options?.label ?? folderId })
			}
		} else {
			// If group exists, return the group id and the groups folder id if it exists
			group = this.controls.groups[groupId].id
			folder = this.controls.groups[groupId].folder ?? folderId
		}

		return [folder, group]
	}

	// Update global states with new control
	pushNewControl(control: Control) {
		// Push control to state
		this.controls.controls[control.id] = control
		// @ts-expect-error
		this.presets.presets.default.configs[control.id] = get(control.config)
	}

	createBooleanControl(
		id: string,
		options?: Partial<ControlOptions>,
		config?: Partial<BooleanControlConfig>
	): Readable<NumberOutput> {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<NumberOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: Partial<ControlOptions> = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new BooleanControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		return control.output
	}

	createNumberControl(
		id: string,
		options?: Partial<ControlOptions>,
		config?: Partial<NumberControlConfig>,
		settings?: Partial<NumberControlSettings>
	) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<NumberOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: Partial<ControlOptions> = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new NumberControl(id, parsedOptions, settings, config)

		// Update store with new control
		this.pushNewControl(control)

		return control.output
	}

	createSelectControl(
		id: string,
		options: Partial<ControlOptions>,
		settings: Partial<SelectControlSettings>,
		config?: Partial<SelectControlConfig>
	) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<SelectOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: Partial<ControlOptions> = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new SelectControl(id, parsedOptions, settings, config)

		// Update store with new control
		this.pushNewControl(control)

		return control.output
	}

	createColorControl(
		id: string,
		options?: Partial<ControlOptions>,
		config?: Partial<ColorControlConfig>
	) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<ColorOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: Partial<ControlOptions> = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new ColorControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		// return colorControl.output
		return control.output
	}

	///////////////////////////////////////////////
	// Getters
	///////////////////////////////////////////////
	getControl(controlId: ControlId) {
		return this.controls.controls[controlId]
	}

	getControlsInGroup(controlsIds: string[], groupId: string) {
		let controlIds: string[] = []

		for (const controlId of controlsIds) {
			const control = this.getControl(controlId)
			if (control.options.group === groupId) {
				controlIds.push(control.id)
			}
		}

		return controlIds
	}

	///////////////////////////////////////////////
	// Presets
	///////////////////////////////////////////////
	// Creates and appends preset to presets (used for creating the default presets)
	// Requires an existing default state so must be called after all createControl functions in visualizer
	createPreset(presetId: PresetId, options: PresetOptions, configs: PresetConfigs) {
		// Escape if preset already exists
		if (this.presets.presets[presetId]) return

		// Create a new preset by recreating existing controls based off merging the default state with the preset configs provided
		let preset = new Preset(presetId, options, configs)

		// Update state with new preset
		this.presets.presets[presetId] = preset
	}

	// Handle changing of presets
	changePreset(presetId: PresetId) {
		// Loop through controls
		for (const [controlId, control] of Object.entries(this.controls.controls)) {
			// Fetch corresponding preset config
			const presetConfig = this.presets.presets[presetId].configs[controlId]

			// Merge preset config with control config
			// @ts-expect-error
			control.config.update((config) => {
				return { ...config, ...presetConfig }
			})
		}
	}

	loadUserPreset(preset: PresetDb) {
		// Convert json to object
		// Clone default preset as a starter
		// Merge user defined settings with default preset (this should handle errors if anything is missing maybe?)
		// Create new preset object in state and set merged control as its object

		// Escape if preset already exists
		if (this.presets.presets[preset.id]) return

		// Escape if schema type is not string
		if (typeof preset.schema !== 'string') return

		const userControls = JSON.parse(preset.schema)

		// Deep clone the default state to use as template control object
		let presetConfigs = deepClone(this.presets.presets.default.configs) as Record<
			string,
			ControlConfig
		>

		for (const [controlId, config] of Object.entries(presetConfigs)) {
			let returnedControl: ControlConfig | undefined = undefined

			// If control has new settings specified in user schema
			if (Object.keys(userControls).includes(controlId)) {
				// Gets corresponding control from default template
				const configTemplate = deepClone(config) as ControlConfig

				// Remove nested properties that don't work with merge (eg: nested arrays or objects)
				for (const value of Object.values(configTemplate)) {
					if (value.type === 'number') {
						// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
						delete configTemplate.range
					}

					if (value.type === 'color') {
						// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
						delete configTemplate.gradient
					}
				}

				// Merge with user settings
				const mergedControl = deepmerge(configTemplate, userControls[controlId])

				returnedControl = mergedControl
			}

			// Overwrite default control to merged control in presetState
			if (returnedControl) {
				presetConfigs[controlId] = returnedControl
			}
		}

		this.presets.presets[preset.id] = new Preset(
			preset.id,
			{ label: preset.name },
			presetConfigs,
			null
		)
	}
}
