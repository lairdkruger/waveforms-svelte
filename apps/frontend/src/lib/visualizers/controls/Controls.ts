import type AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
import type Midi from '$lib/visualizers/midi/Midi'
import type {
	BooleanSignal,
	BooleanSignalFunction,
	Control,
	ControlConfig,
	ControlId,
	SignalFunctionConfig,
	Controls as ControlsState,
	BooleanOutput,
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
	ColorControlConfig
} from './types'
import type { Preset as PresetDb } from 'supabase'
import type { PresetId } from './types/presets'
import { deepClone } from '$lib/visualizers/utils/Objects'
import type { MidiControlId } from '$lib/visualizers/midi/Midi'
import { deepmerge } from 'deepmerge-ts'
import { writable, type Readable, type Writable } from 'svelte/store'
import BooleanControl from './library/controls/BooleanControl'
import type Signal from './library/signals/Signal'
import NumberControl from './library/controls/NumberControl'
import SelectControl from './library/controls/SelectControl'
import ColorControl from './library/controls/ColorControl'

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
			default: {
				id: 'default',
				name: 'default',
				controls: {},
				midiBinding: null
			}
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
	// Returned SignalFunctions must have working output functions (these should already be set by the corrosponding store)
	getSignalFunction(signalFunctionConfig: SignalFunctionConfig) {
		if (signalFunctionConfig.context === 'audio') {
			const audioSignalFunction = this.audioAnalyzer.getSignalFunction(signalFunctionConfig.id)
			if (audioSignalFunction) return audioSignalFunction
		}

		if (signalFunctionConfig.context === 'midi') {
			const midiSignalFunction = this.midi[signalFunctionConfig.id]

			if (!midiSignalFunction) {
				// If midi function doesn't exist, we need to create one
				const midiSignalFunction = this.midi.createMidiSignalFunction(signalFunctionConfig.id)
				return midiSignalFunction
			}

			return midiSignalFunction
		}

		// Fallback to null, usually means audio or midi contexts weren't ready
		return null
	}

	createSignalId(controlId: ControlId, signalId = 'main') {
		return `${controlId}_signal_${signalId}`
	}

	createBoosterSignal(controlId: ControlId, signalFunctionConfig: SignalFunctionConfig) {
		const signalFunction = this.getSignalFunction(signalFunctionConfig) as BooleanSignalFunction
		if (!signalFunction) return null

		const signal: BooleanSignal = {
			id: this.createSignalId(controlId, 'booster'),
			type: 'boolean',
			function: signalFunction
		}

		return signal
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

		// Push to both the control state and the default preset (no deep clone required since these folders/groups are constant across presets)
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

		// Push to both the control state and the default preset (no deep clone required since these folders/groups are constant across presets)
		this.controls.groups[id] = group

		return id
	}

	// Creates groups & folders if they don't already exist
	createStructure(id: string, options?: ControlOptions) {
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
		this.presets.presets.default.controls[control.id] = control
	}

	createBooleanControl(
		id: string,
		options?: ControlOptions,
		config?: BooleanControlConfig
	): Readable<BooleanOutput> {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<BooleanOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new BooleanControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		return control.output
	}

	createNumberControl(
		id: string,
		options?: ControlOptions,
		config?: NumberControlConfig,
		settings?: NumberControlSettings
	) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<NumberOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new NumberControl(id, parsedOptions, config, settings)

		// Update store with new control
		this.pushNewControl(control)

		return control.output
	}

	createSelectControl(id: string, options?: ControlOptions, config?: SelectControlConfig) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<SelectOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new SelectControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		return control.output
	}

	createColorControl(id: string, options?: ControlOptions, config?: Partial<ColorControlConfig>) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output as Readable<ColorOutput>

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

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
	createPreset(presetId: PresetId, configs: Record<string, ControlConfig>) {
		// Escape if preset already exists
		if (this.presets.presets[presetId]) return

		// Deep clone the default state to use as template control object
		let presetControls = deepClone(this.presets.presets.default.controls) as Record<
			string,
			Control
		>

		// Merge controls of default state with control options given as config of preset and update control output function
		for (const [controlId, control] of Object.entries(presetControls)) {
			let returnedControl: Control | undefined = undefined

			// If control has new settings specified in config
			if (Object.keys(configs).includes(controlId)) {
				// Gets corresponding control from default template
				const controlTemplate = deepClone(control) as Control

				// Construct options object from template control
				const options: ControlOptions = {
					label: controlTemplate.label,
					group: controlTemplate.group,
					folder: controlTemplate.folder
				}

				// Construct config and create new control for each config based on control types
				let signalFunctionConfig: SignalFunctionConfig | undefined
				// Create signal function config
				if (
					controlTemplate.type === 'boolean' ||
					controlTemplate.type === 'number' ||
					controlTemplate.type === 'color'
				) {
					signalFunctionConfig = controlTemplate.signal
						? {
								context: controlTemplate.signal.function.context,
								type: controlTemplate.signal.function.type,
								id: controlTemplate.signal.function.id
						  }
						: undefined
				}

				// Boolean
				if (controlTemplate.type === 'boolean') {
					const configTemplate: BooleanControlConfig = {
						signalFunctionConfig: signalFunctionConfig,
						defaultValue: controlTemplate.defaultValue
					}

					// Custom config
					const typedConfig = configs[controlTemplate.id] as BooleanControlConfig

					// Merge configs into complete config
					const config: BooleanControlConfig = { ...configTemplate, ...typedConfig }

					returnedControl = this.constructBooleanControl(controlTemplate.id, options, config)

					// Number
				} else if (controlTemplate.type === 'number') {
					const configTemplate: NumberControlConfig = {
						signalFunctionConfig: signalFunctionConfig,
						defaultValue: controlTemplate.defaultValue,
						range: controlTemplate.range,
						ease:
							controlTemplate.signal?.type === 'number' ? controlTemplate.signal.ease : 'in',
						behaviour:
							controlTemplate.signal?.type === 'number'
								? controlTemplate.signal.behaviour
								: 'straight'
					}

					// Custom config
					const typedConfig = configs[controlTemplate.id] as NumberControlConfig

					// Merge configs into complete config
					const config: NumberControlConfig = { ...configTemplate, ...typedConfig }

					returnedControl = this.constructNumberControl(controlTemplate.id, options, config)

					// Color
				} else if (controlTemplate.type === 'color') {
					const configTemplate: ColorControlConfig = {
						signalFunctionConfig: signalFunctionConfig,
						defaultValue: controlTemplate.defaultValue,
						gradient: controlTemplate.gradient,
						ease:
							controlTemplate.signal?.type === 'number'
								? controlTemplate.signal.ease
								: undefined,
						behaviour:
							controlTemplate.signal?.type === 'number'
								? controlTemplate.signal.behaviour
								: undefined
					}

					// Custom config
					const typedConfig = configs[controlTemplate.id] as ColorControlConfig

					// Merge configs into complete config
					const config: ColorControlConfig = { ...configTemplate, ...typedConfig }

					returnedControl = this.constructColorControl(controlTemplate.id, options, config)

					// Select
				} else if (controlTemplate.type === 'select') {
					const configTemplate: SelectControlConfig = {
						defaultValue: controlTemplate.defaultValue,
						values: controlTemplate.values
					}

					// Custom config
					const typedConfig = configs[controlTemplate.id] as SelectControlConfig

					// Merge configs into complete config
					const config: SelectControlConfig = { ...configTemplate, ...typedConfig }

					returnedControl = this.constructSelectControl(controlTemplate.id, options, config)
				}

				if (returnedControl) {
					presetControls[controlId] = returnedControl
				}
			}
		}

		// Update state with new preset
		this.presets.presets[presetId] = {
			id: presetId,
			name: presetId,
			controls: presetControls,
			midiBinding: null
		}
	}

	// Handle changing of presets
	changePreset(presetId: PresetId) {
		// Fetch new control state settings from preset
		const newControlState = this.presets.presets[presetId].controls

		// Update state to use fresh deep clone preset
		// ISSUE: There is an issue here as we do actually need the transformer function to get copied across and deepClone doesn't include functions
		this.presets.preset = presetId
		this.controls.controls = deepClone(newControlState) as Record<string, Control>

		// Update output functions for each control
		for (const controlId of Object.keys(this.controls.controls)) {
			this.updateControlOutput(controlId)
		}
	}

	loadUserPreset(preset: PresetDb) {
		// convert json to object
		// clone default preset as a starter
		// merge user defined settings with default preset (this should handle errors if anything is missing maybe?)
		// create new preset object in state and set merged control as its object

		// Escape if preset already exists
		if (this.presets.presets[preset.id]) return

		// Escape if schema type is not string
		if (typeof preset.schema !== 'string') return

		const userControls = JSON.parse(preset.schema)
		// Deep clone the default state to use as template control object
		let presetControls = deepClone(this.presets.presets.default.controls) as Record<
			string,
			Control
		>

		for (const [controlId, control] of Object.entries(presetControls)) {
			let returnedControl: Control | undefined = undefined

			// If control has new settings specified in user schema
			if (Object.keys(userControls).includes(controlId)) {
				// Gets corresponding control from default template
				const controlTemplate = deepClone(control) as Control

				// Remove nested properties that don't work with merge (eg: nested arrays or objects)
				for (const value of Object.values(controlTemplate)) {
					if (value.type === 'number') {
						// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
						delete controlTemplate.range
					}

					if (value.type === 'color') {
						// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
						delete controlTemplate.gradient
					}

					if (value.type === 'select') {
						// @ts-expect-error because we're removing a non-optional property, but we're guaranteed to get it back from the merge
						delete controlTemplate.values
					}
				}

				// Merge with user settings
				const mergedControl = deepmerge(controlTemplate, userControls[controlId])

				returnedControl = mergedControl
			}

			// Overwrite default control to merged control in presetState
			if (returnedControl) {
				presetControls[controlId] = returnedControl
			}
		}

		// Update state with new preset
		this.presets.presets[preset.id] = {
			id: preset.id,
			name: preset.name,
			controls: presetControls,
			midiBinding: preset.midi_binding
		}
	}

	setPresetMidiBinding(presetId: PresetId, midiControlId: MidiControlId) {
		this.presets.presets[presetId].midiBinding = midiControlId
	}
}
