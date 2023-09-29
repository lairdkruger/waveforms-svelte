import type AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
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
import type { CurrentControlConfigs, PresetConfigs, PresetId, PresetOptions } from './types/presets'
import { deepClone } from '$lib/visualizers/utils/Objects'
import { deepmerge } from 'deepmerge-ts'
import { writable, type Readable, type Writable, get } from 'svelte/store'
import BooleanControl from './library/controls/BooleanControl'
import type Signal from './library/signals/Signal'
import NumberControl from './library/controls/NumberControl'
import SelectControl from './library/controls/SelectControl'
import ColorControl from './library/controls/ColorControl'
import Preset from './library/presets/Preset'
import type Midi from '../midi/Midi'

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
		preset: writable('default'),
		presets: writable({
			default: new Preset('default', { label: 'Default' }, {}, null)
		})
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
	// Utility Functions
	///////////////////////////////////////////////
	resetInteractions() {
		this.draggedSignal.set(null)
		this.draggedSignalTarget.set(null)
	}

	// Extracts current configs from controls store in a Json stringify friendly format
	extractCurrentControlConfigs(): CurrentControlConfigs {
		let configs: CurrentControlConfigs = {}

		for (const [controlId, control] of Object.entries(this.controls.controls)) {
			// Serialize control config which should also serialize nested signals and boosters
			const controlConfig = control.extractConfig()
			configs[controlId] = controlConfig
		}

		return configs
	}

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

		// Also push control config to default preset
		this.presets.presets.update((presets) => {
			let updatedPresets = { ...presets }
			// @ts-expect-error
			updatedPresets.default.configs[control.id] = get(control.config)
			return updatedPresets
		})
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
		const presets = get(this.presets.presets)
		if (presets[presetId]) return

		// Create a new preset by recreating existing controls based off merging the default state with the preset configs provided
		let preset = new Preset(presetId, options, configs)

		// Update state with new preset
		this.presets.presets.update((presets) => {
			let updatedPresets = { ...presets }
			updatedPresets[presetId] = preset
			return updatedPresets
		})
	}

	// Handle changing of presets
	changePreset(presetId: PresetId) {
		const presets = get(this.presets.presets)
		const preset = presets[presetId]

		// Loop through controls
		for (const [controlId, control] of Object.entries(this.controls.controls)) {
			// Fetch corresponding preset config
			const presetConfig = preset?.configs[controlId]

			// Merge preset config with control config
			// @ts-expect-error
			control.config.update((config) => {
				return { ...config, ...presetConfig }
			})
		}

		this.presets.preset.set(presetId)
	}

	loadUserPreset(preset: PresetDb, controlConfigs: Record<ControlId, ControlConfig>) {
		// Convert json to object
		// Clone default preset as a starter
		// Merge user defined settings with default preset (this should handle errors if anything is missing maybe?)
		// Create new preset object in state and set merged control as its object

		const presets = get(this.presets.presets)

		// Deep clone the default state to use as template control object
		let presetConfigs = deepClone(presets.default.configs) as Record<string, ControlConfig>

		for (const [controlId, config] of Object.entries(presetConfigs)) {
			let returnedControl: ControlConfig | undefined = undefined

			// If control has new settings specified in user schema
			if (Object.keys(controlConfigs).includes(controlId)) {
				// Gets corresponding control from default template
				const configTemplate = deepClone(config) as ControlConfig

				if ('gradient' in configTemplate) {
					// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
					delete configTemplate.gradient
				}

				if ('range' in configTemplate) {
					// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
					delete configTemplate.range
				}

				// Merge with user settings
				const mergedControl = deepmerge(
					configTemplate,
					controlConfigs[controlId]
				) as ControlConfig

				returnedControl = mergedControl
			}

			// Overwrite default control to merged control in presetState
			if (returnedControl) {
				presetConfigs[controlId] = returnedControl
			}
		}

		this.presets.presets.update((presets) => {
			let updatedPresets = { ...presets }
			updatedPresets[preset.id] = new Preset(
				preset.id,
				{ label: preset.name },
				presetConfigs,
				null
			)
			return updatedPresets
		})
	}
}
