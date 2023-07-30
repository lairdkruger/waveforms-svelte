import type AudioAnalyzer from '$lib/visualizers/audio/AudioAnalyzer'
import type Midi from '$lib/visualizers/midi/Midi'
import bezier, { getBezierValues, type Ease } from '$lib/visualizers/utils/CubicBezier'
import { closest2, lerpColors, map, mapLoop } from '$lib/visualizers/utils/Maths'
import type {
	BooleanSignal,
	BooleanSignalFunction,
	Control,
	ControlConfig,
	ControlId,
	NumberSignal,
	SignalBehaviour,
	SignalFunctionConfig,
	Controls as ControlsState,
	BooleanOutput,
	NumberOutput,
	ColorOutput,
	ColorControl,
	ColorStop,
	SelectOutput,
	SelectControl,
	ControlOutput,
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
	Color
} from './types'
import type { Preset as PresetDb } from 'supabase'
import type { PresetId } from './types/presets'
import { deepClone } from '$lib/visualizers/utils/Objects'
import type { MidiControlId } from '$lib/visualizers/midi/Midi'
import { deepmerge } from 'deepmerge-ts'
import { get, writable, type Readable, type Writable } from 'svelte/store'
import BooleanControl from './library/controls/BooleanControl'
import type Signal from './library/signals/Signal'
import NumberControl from './library/controls/NumberControl'

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

	// Create a new signal object using the proposed signal function
	createSignal(controlId: ControlId, config?: ControlConfig) {
		if (!config || !('signalFunctionConfig' in config) || !config.signalFunctionConfig)
			return null

		let signalFunction = this.getSignalFunction(config.signalFunctionConfig)

		if (!signalFunction) return null

		let signal: Signal

		// Defaults
		const defaultEase: Ease = signalFunction.context === 'midi' ? 'linear' : 'in' // Default to linear for midi
		const defaultBehaviour: SignalBehaviour = 'straight'

		if (signalFunction.type === 'boolean') {
			signal = {
				id: this.createSignalId(controlId),
				type: 'boolean',
				function: signalFunction
			} as BooleanSignal
		} else {
			// Fallback to number signal type
			signal = {
				id: this.createSignalId(controlId),
				type: signalFunction.type ?? 'number',
				function: signalFunction,
				ease: defaultEase,
				behaviour: defaultBehaviour
			} as NumberSignal
		}

		if (config) {
			if ('booster' in config && config.booster && signalFunction.type === 'number') {
				const boosterSignal = this.createBoosterSignal(
					controlId,
					config.booster
				) as BooleanSignal
				signal = { ...signal, booster: boosterSignal } as NumberSignal
			}

			if ('ease' in config && signal?.type === 'number') {
				signal = { ...signal, ease: config.ease ?? defaultEase } as NumberSignal
			}

			if ('behaviour' in config && signal?.type === 'number') {
				signal = {
					...signal,
					behaviour: config.behaviour ?? defaultBehaviour
				} as NumberSignal
			}
		}

		return signal
	}

	///////////////////////////////////////////////
	// Controls Functions
	///////////////////////////////////////////////
	// Update a controls signal function (by creating a new one with updated settings)
	updateSignalFunction(controlId: ControlId) {
		const control = this.getControl(controlId)

		if (!control || !('signal' in control)) return null

		if (get(control).signal?.function) {
			// Create a new signal with updated config settings
			const config = this.getControlConfig(controlId)
			if (!config) return null

			const signal = this.createSignal(controlId, config)

			// Handle edge case where signal construction failed, means audio or midi contexts weren't ready
			if (!signal) {
				// Set signal to undefined since contexts aren't ready yet
				// control.signal = undefined
				control.update((control) => {
					control.signal = undefined
					return control
				})
				return null
			}

			// Set new signal to controls signal
			// control.signal = signal
			control.update((control) => {
				control.signal = signal
				return control
			})
		}
	}

	deleteConnection(controlId: ControlId) {
		const control = this.getControl(controlId)

		if (control.type === 'select') return null

		// Reset the signal function output
		control.signal = undefined

		this.updateControlOutput(controlId)
		this.resetInteractions()
	}

	// Updates control with fresh values
	updatedBooleanOutput(controlId: ControlId): BooleanOutput {
		// Ensure that the signal always has a function
		this.updateSignalFunction(controlId)

		// Get control and manage escapes
		const control = get(this.getControl(controlId))
		if (!control) return () => 0
		if (control.type !== 'boolean') return () => 0

		const outputFunction = () => {
			// Output functions must not reference external control variable (avoids cyclic closure reference)
			const control = get(this.getControl(controlId)) as BooleanControl
			if (!control.signal) return control.defaultValue
			return control.signal.function?.output() ?? control.defaultValue
		}

		return outputFunction
	}

	// Updates control with fresh values
	updatedNumberOutput(controlId: ControlId): NumberOutput {
		// Ensure that the signal always has a function
		this.updateSignalFunction(controlId)

		// Get control and manage escapes
		const control = this.getControl(controlId) as NumberControl

		if (!control) return () => 0
		if (control.type !== 'number') return () => 0

		const outputFunction = () => {
			// Output functions must not reference external control variable (avoids cyclic closure reference)
			const control = this.getControl(controlId) as NumberControl
			// Get transformer function default control since this controls transformer function has probably been yeeted by deepClone
			const transformer =
				// @ts-expect-error We can actually assume settings exists since this can be inferred that its a number control
				this.presets.presets.default.controls[controlId].settings?.transformer

			if (!control.signal)
				return transformer ? transformer(control.defaultValue) : control.defaultValue

			// Return either volume, bass, mids or highs peak volume to use for more accurate mapping
			const peakValue = () => {
				if (control.signal?.function.context === 'audio') {
					if (control.signal?.id === 'getVolume') return this.audioAnalyzer.getPeakVolume()
					if (control.signal?.id === 'getBassVolume')
						return this.audioAnalyzer.getPeakBassVolume()
					if (control.signal?.id === 'getMidsVolume')
						return this.audioAnalyzer.getPeakMidsVolume()
					if (control.signal?.id === 'getHighsVolume')
						return this.audioAnalyzer.getPeakHighsVolume()
					return this.audioAnalyzer.getPeakVolume()
				} else {
					// At the moment, all other inputs (midi etc) just range from 0-1
					return 1
				}
			}

			// When signal is being boosted: it always returns its max value
			const isBoosted =
				control.signal.type === 'number' &&
				control.signal.booster &&
				control.signal.booster.function.output()

			// Normalize various signal inputs to [0, 1]
			const normalizedValue =
				control.signal.type === 'boolean'
					? control.signal.function.output()
					: isBoosted
					? 1
					: map(control.signal.function.output(), 0, peakValue(), 0, 1)

			const bezierValues =
				control.signal?.type === 'number' ? getBezierValues(control.signal.ease) : null
			const bezierMap = bezierValues ? bezier(bezierValues) : null

			// Get bezier value based on current signal ease
			const bezierValue = bezierMap ? bezierMap(normalizedValue) : normalizedValue

			// Handle behaviours
			const loopingBehaviour =
				control.signal.type === 'number' &&
				control.signal.behaviour &&
				control.signal.behaviour === 'loop'

			let outputValue: number = 0

			if (!loopingBehaviour) {
				// Straight behaviour
				// Map and clamp to control range
				const denormalizedValue = map(bezierValue, 0, 1, control.range[0], control.range[1])
				outputValue = denormalizedValue
			} else {
				// Looping behaviour
				// Map bezier value to speed range
				const minSpeed = 0 // Number can be still at points of silence
				const maxSpeed = 2
				const speedValue = map(normalizedValue, 0, 1, minSpeed, maxSpeed)

				// Use speed value as speed for looping (ping pong)
				const loopValue = mapLoop(speedValue)

				const finalValue = map(loopValue, 0, 1, control.range[0], control.range[1])

				outputValue = finalValue
			}

			return transformer ? transformer(outputValue) : outputValue
		}

		return outputFunction
	}

	// Updates control with fresh values
	updatedColorOutput(controlId: ControlId): ColorOutput {
		// Ensure that the signal always has a function
		this.updateSignalFunction(controlId)

		// Get control and manage escapes
		const control = this.getControl(controlId)
		if (!control) return () => [0, 0, 0]
		if (control.type !== 'color') return () => [0, 0, 0]

		// Ensure gradient is sorted whenever color control is updated
		control.gradient = control.gradient.sort((a, b) => a.coord - b.coord)

		// No lightweight output function since returned color always has to be calculated

		const mixAmountFunction = () => {
			// Output functions must not reference external control variable (avoids cyclic closure reference)
			const control = this.getControl(controlId) as NumberControl

			// Escape here if function is not a signal function
			if (!control.signal) return control.defaultValue

			// Return either volume, bass, mids or highs peak volume to use for more accurate mapping
			const peakValue = () => {
				if (control.signal?.function.context === 'audio') {
					if (control.signal?.id === 'getVolume') return this.audioAnalyzer.getPeakVolume()
					if (control.signal?.id === 'getBassVolume')
						return this.audioAnalyzer.getPeakBassVolume()
					if (control.signal?.id === 'getMidsVolume')
						return this.audioAnalyzer.getPeakMidsVolume()
					if (control.signal?.id === 'getHighsVolume')
						return this.audioAnalyzer.getPeakHighsVolume()
					return this.audioAnalyzer.getPeakVolume()
				} else {
					// At the moment, all other inputs (midi etc) just range from 0-1
					return 1
				}
			}

			// When signal is being boosted: it always return its max value
			const isBoosted =
				control.signal.type === 'number' &&
				control.signal.booster &&
				control.signal.booster.function.output()

			// Normalize various signal inputs to [0, 1]
			const normalizedValue =
				control.signal.type === 'boolean'
					? control.signal.function.output()
					: isBoosted
					? 1
					: map(control.signal.function.output(), 0, peakValue(), 0, 1)

			const bezierValues =
				control.signal?.type === 'number' ? getBezierValues(control.signal.ease) : null
			const bezierMap = bezierValues ? bezier(bezierValues) : null

			// Return blend value [0 ... 1] either bezier mapped value, or just normalized value
			const mixAmount = bezierMap ? bezierMap(normalizedValue) : normalizedValue

			// Handle behaviours
			const loopingBehaviour =
				control.signal.type === 'number' &&
				control.signal.behaviour &&
				control.signal.behaviour === 'loop'

			let outputValue: number = 0

			if (!loopingBehaviour) {
				// Straight behaviour
				outputValue = mixAmount
			} else {
				// Looping behaviour
				// Map bezier value to speed range
				const minSpeed = 0.1 // Always moving for colors
				const maxSpeed = 2
				const speedValue = map(mixAmount, 0, 1, minSpeed, maxSpeed)

				// Use speed value as speed for looping (ping pong)
				const loopValue = mapLoop(speedValue)

				outputValue = loopValue
			}

			return outputValue
		}

		const mix = () => mixAmountFunction()

		const outputFunction = () => {
			const control = this.getControl(controlId) as ColorControl
			const mixAmount = mix()

			// Get and return the two colors whose mix amounts are closest to the current mix amount
			function getColorsMix(mix: number, gradient: ColorStop[]): [ColorStop, ColorStop] {
				const colorIndexes = gradient.map((color) => color.coord)

				// If gradient is single color, just return that color
				if (gradient.length <= 1) return [gradient[0], gradient[0]]

				const closest = closest2(mix, colorIndexes)
				return [gradient[closest[0]], gradient[closest[1]]]
			}

			const colors = getColorsMix(mixAmount, control.gradient)
			const edgeColor = colors[0].color === colors[1].color

			// Normalize mix so it goes from [0...1] between the two colors indexes (indexes)
			const normalizedMix = map(mixAmount, colors[0].coord, colors[1].coord, 0, 1)
			const color = edgeColor
				? colors[0].color
				: lerpColors([colors[0].color, colors[1].color], normalizedMix)

			return color
		}

		// Call mix function once
		return outputFunction
	}

	// Updates control with fresh values
	updatedSelectOutput(controlId: ControlId): SelectOutput {
		// Ensure that the signal always has a function
		this.updateSignalFunction(controlId)

		// Get control and manage escapes
		const control = this.getControl(controlId) as SelectControl

		const output = () => control.defaultValue
		return output
	}

	// Generic function for updating any controls output function
	updateControlOutput(controlId: ControlId) {
		const control = this.getControl(controlId)

		let output: ControlOutput = () => 1

		if (get(control).type === 'boolean') {
			output = this.updatedBooleanOutput(controlId)
		} else if (get(control).type === 'number') {
			output = this.updatedNumberOutput(controlId)
		} else if (get(control).type === 'select') {
			output = this.updatedSelectOutput(controlId)
		} else if (get(control).type === 'color') {
			output = this.updatedColorOutput(controlId)
		}

		// this.getControl(controlId).output = output
		control.update((control) => {
			control.output = output
			return control
		})
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

	// Contruct Control object out of options and config
	// constructBooleanControl(id: string, options?: ControlOptions, config?: BooleanControlConfig) {
	// 	const defaultOutputFunction: BooleanOutput = config?.defaultValue
	// 		? () => config.defaultValue!
	// 		: () => 1
	// 	const signal = this.createSignal(id, config)

	// 	// Build control using config and options
	// 	const control: BooleanControl = {
	// 		id: id,
	// 		type: 'boolean',
	// 		label: options?.label ?? id,
	// 		folder: options?.folder ?? id,
	// 		group: options?.group ?? id,
	// 		signal: signal && signal.type === 'boolean' ? signal : undefined,
	// 		output: defaultOutputFunction,
	// 		defaultValue: config?.defaultValue ?? 1
	// 	}

	// 	return control
	// }

	createBooleanControl(
		id: string,
		options?: ControlOptions,
		config?: BooleanControlConfig
	): Readable<BooleanOutput> {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new BooleanControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		// Return singleton of updated output function
		// this.updateControlOutput(id)
		// const booleanControl = get(this.getControl(id)) as BooleanControl

		return control.output
	}

	getBooleanControlConfig(controlId: ControlId): BooleanControlConfig {
		const control = this.getControl(controlId) as BooleanControl
		const config: BooleanControlConfig = {
			defaultValue: control.defaultValue,
			signalFunctionConfig: control.signal
				? {
						context: control.signal?.function.context,
						id: control.signal?.function.id
				  }
				: undefined
		}
		return config
	}

	// Contruct Control object out of options and config
	constructNumberControl(
		id: string,
		options?: ControlOptions,
		config?: NumberControlConfig,
		settings?: NumberControlSettings
	) {
		const defaultOutputFunction: NumberOutput = config?.defaultValue
			? () => config.defaultValue!
			: () => 1

		const signal = this.createSignal(id, config)

		// Check to see if default value is out of range
		const defaultValue = config?.defaultValue ?? 1
		const inRange =
			config?.range &&
			defaultValue >= Math.min(config.range[0], config.range[1]) &&
			config?.range &&
			defaultValue <= Math.max(config.range[0], config.range[1])

		// Build control using config and options
		const control: NumberControl = {
			id: id,
			type: 'number',
			label: options?.label ?? id,
			folder: options?.folder ?? id,
			group: options?.group ?? id,
			signal: signal ? signal : undefined,
			output: defaultOutputFunction,
			defaultValue: config?.defaultValue ?? 1,
			range: inRange && config?.range ? config.range : [defaultValue - 1, defaultValue + 1],
			settings: settings
		}

		return control
	}

	createNumberControl(
		id: string,
		options?: ControlOptions,
		config?: NumberControlConfig,
		settings?: NumberControlSettings
	) {
		// Escape if already exists
		if (this.getControl(id)) return this.getControl(id).output

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = new NumberControl(id, parsedOptions, config, settings)

		// Update store with new control
		this.pushNewControl(control)

		// Return singleton of updated output function
		// this.updateControlOutput(id)
		// const numberControl = this.getControl(id) as NumberControl

		return control.output
	}

	getBoosterSignalFunctionConfig(
		boosterSignal: BooleanSignal | undefined
	): SignalFunctionConfig | undefined {
		if (!boosterSignal) return undefined
		const config: SignalFunctionConfig = {
			context: boosterSignal.function.context,
			id: boosterSignal.function.id
		}

		return config
	}

	getNumberControlConfig(controlId: ControlId): NumberControlConfig {
		const control = this.getControl(controlId) as NumberControl

		const boosterSignalFunctionConfig =
			control.signal && control.signal.type === 'number'
				? this.getBoosterSignalFunctionConfig(control.signal.booster)
				: undefined

		const config: NumberControlConfig = {
			defaultValue: control.defaultValue,
			signalFunctionConfig: control.signal
				? {
						context: control.signal?.function.context,
						id: control.signal?.function.id
				  }
				: undefined,
			range: control.range,
			ease: control.signal && control.signal.type === 'number' ? control.signal.ease : undefined,
			booster: boosterSignalFunctionConfig,
			behaviour:
				control.signal && control.signal.type === 'number'
					? control.signal.behaviour
					: undefined
		}
		return config
	}

	// Contruct Control object out of options and config
	constructSelectControl(id: string, options: ControlOptions, config: SelectControlConfig) {
		const defaultOutputFunction: SelectOutput = () => config.defaultValue

		// Build control using config and options
		const control: SelectControl = {
			id: id,
			type: 'select',
			label: options?.label ?? id,
			folder: options?.folder ?? id,
			group: options?.group ?? id,
			output: defaultOutputFunction,
			defaultValue: config.defaultValue,
			values: config.values
		}

		return control
	}

	createSelectControl(id: string, options: ControlOptions, config: SelectControlConfig) {
		// Escape if already exists
		if (this.getControl(id)) {
			const control = this.getControl(id) as SelectControl
			return control.output
		}

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = this.constructSelectControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		// Return singleton of updated output function
		this.updateControlOutput(id)
		const selectControl = this.getControl(id) as SelectControl

		return selectControl.output
	}

	getSelectControlConfig(controlId: ControlId): SelectControlConfig {
		const control = this.getControl(controlId) as SelectControl

		const config: SelectControlConfig = {
			defaultValue: control.defaultValue,
			values: control.values
		}

		return config
	}

	// Contruct Control object out of options and config
	constructColorControl(id: string, options?: ControlOptions, config?: ColorControlConfig) {
		const defaultOutputFunction: () => [number, number, number] = () => [1, 1, 1]

		const defaultGradient: ColorStop[] = [
			{
				id: crypto.randomUUID(), // Assign random key
				coord: 0,
				color: [0, 0, 0]
			},
			{
				id: crypto.randomUUID(), // Assign random key
				coord: 1,
				color: [1, 1, 1]
			}
		]

		// Attach keys to config gradient if given
		if (config?.gradient) {
			for (let colorStop of config.gradient) {
				colorStop.id = crypto.randomUUID()
			}
		}

		const signal = this.createSignal(id, config)

		// Build control using config and options
		const control: ColorControl = {
			id: id,
			type: 'color',
			label: options?.label ?? id,
			folder: options?.folder ?? id,
			group: options?.group ?? id,
			signal: signal ? signal : undefined,
			output: defaultOutputFunction,
			defaultValue: config?.defaultValue ?? 1,
			gradient: config?.gradient ?? defaultGradient
		}

		return control
	}

	createColorControl(id: string, options?: ControlOptions, config?: ColorControlConfig) {
		// Escape if already exists
		if (this.getControl(id)) {
			const control = this.getControl(id) as ColorControl
			return control.output
		}

		// Create group & folder structure if required
		const [folder, group] = this.createStructure(id, options)
		const parsedOptions: ControlOptions = { ...options, folder: folder, group: group }

		// Construct control object
		const control = this.constructColorControl(id, parsedOptions, config)

		// Update store with new control
		this.pushNewControl(control)

		// Return singleton of updated output function
		this.updateControlOutput(id)
		const colorControl = this.getControl(id) as ColorControl

		return colorControl.output
	}

	getColorControlConfig(controlId: ControlId): ColorControlConfig {
		const control = this.getControl(controlId) as ColorControl

		const boosterSignalFunctionConfig =
			control.signal && control.signal.type === 'number'
				? this.getBoosterSignalFunctionConfig(control.signal.booster)
				: undefined

		const config: ColorControlConfig = {
			defaultValue: control.defaultValue,
			signalFunctionConfig: control.signal
				? {
						context: control.signal?.function.context,
						id: control.signal?.function.id
				  }
				: undefined,
			gradient: control.gradient,
			ease: control.signal && control.signal.type === 'number' ? control.signal.ease : undefined,
			booster: boosterSignalFunctionConfig,
			behaviour:
				control.signal && control.signal.type === 'number'
					? control.signal.behaviour
					: undefined
		}
		return config
	}

	// Backward constructs a config object from a control object
	getControlConfig(controlId: ControlId) {
		const control = this.getControl(controlId)

		// Handle configs for different control types (just reverse construction functions)
		if (control.type === 'number') {
			return this.getNumberControlConfig(controlId)
		} else if (control.type === 'boolean') {
			return this.getBooleanControlConfig(controlId)
		} else if (control.type === 'select') {
			return this.getSelectControlConfig(controlId)
		} else if (control.type === 'color') {
			return this.getColorControlConfig(controlId)
		} else {
			return null
		}
	}

	///////////////////////////////////////////////
	// Controls Setter Functions
	///////////////////////////////////////////////
	setBooleanControlValue(controlId: ControlId, value: 0 | 1) {
		const control = this.getControl(controlId)
		control.update((control) => {
			control.defaultValue = value
			return control
		})

		this.updateControlOutput(controlId)
	}

	setBooleanControlSignal(controlId: ControlId, signalFunctionConfig: SignalFunctionConfig) {
		const control = this.getControl(controlId) as BooleanControl

		// Extract config object out of control
		let config = this.getBooleanControlConfig(controlId)

		// Update the config object to use the signal function provided
		config.signalFunctionConfig = signalFunctionConfig

		// Create a new signal object from the config
		const signal = this.createSignal(controlId, config)

		if (!signal) return null

		// Assign the new signal to the control
		control.signal = signal as BooleanSignal

		this.updateControlOutput(controlId)
	}

	setNumberControlValue(controlId: ControlId, value: number) {
		const control = this.getControl(controlId) as NumberControl
		control.defaultValue = value

		// Revalidate range values
		if (value > control.range[1]) {
			control.range[1] = control.defaultValue
		}

		if (value < control.range[0]) {
			control.range[0] = control.defaultValue
		}

		this.updateControlOutput(controlId)
	}

	setNumberControlUpperRange(controlId: ControlId, value: number) {
		const control = this.getControl(controlId) as NumberControl
		control.range[1] = value

		// Revalidate range values
		if (control.defaultValue > value) {
			control.defaultValue = value
		}

		this.updateControlOutput(controlId)
	}

	setNumberControlLowerRange(controlId: ControlId, value: number) {
		const control = this.getControl(controlId) as NumberControl
		control.range[0] = value

		// Revalidate range values
		if (control.defaultValue < value) {
			control.defaultValue = value
		}

		this.updateControlOutput(controlId)
	}

	setNumberControlSignal(controlId: ControlId, signalFunctionConfig: SignalFunctionConfig) {
		const control = this.getControl(controlId) as NumberControl

		// Extract config object out of control
		let config = this.getNumberControlConfig(controlId)

		// Update the config object to use the signal function provided
		config.signalFunctionConfig = signalFunctionConfig

		// Create a new signal object from the config
		const signal = this.createSignal(controlId, config)

		if (!signal) return null

		// Assign the new signal to the control
		control.signal = signal

		this.updateControlOutput(controlId)
	}

	setSelectControlValue(controlId: ControlId, value: string) {
		const control = this.getControl(controlId)
		control.defaultValue = value

		this.updateControlOutput(controlId)
	}

	setColorControlValue(controlId: ControlId, value: number) {
		const control = this.getControl(controlId)
		control.defaultValue = value

		this.updateControlOutput(controlId)
	}

	setColorControlSignal(controlId: ControlId, signalFunctionConfig: SignalFunctionConfig) {
		const control = this.getControl(controlId) as ColorControl

		// Extract config object out of control
		let config = this.getNumberControlConfig(controlId)

		// Update the config object to use the signal function provided
		config.signalFunctionConfig = signalFunctionConfig

		// Create a new signal object from the config
		const signal = this.createSignal(controlId, config)
		if (!signal) return null

		// Assign the new signal to the control
		control.signal = signal

		this.updateControlOutput(controlId)
	}

	setColorControlColorCoord(controlId: ControlId, colorStopId: string, value: number) {
		const control = this.getControl(controlId) as ColorControl
		const color = control.gradient.find((color) => color.id === colorStopId)
		if (!color) return
		color.coord = value

		this.updateControlOutput(controlId)
	}

	colorControlAddColorStop(controlId: ControlId, colorStop: ColorStop) {
		const control = this.getControl(controlId) as ColorControl
		control.gradient.push(colorStop)

		this.updateControlOutput(controlId)
	}

	colorControlRemoveColorStop(controlId: ControlId, colorStopId: string) {
		const control = this.getControl(controlId) as ColorControl
		control.gradient = control.gradient.filter((colorStop) => colorStop.id !== colorStopId)

		this.updateControlOutput(controlId)
	}

	colorControlSetColorStopColor(controlId: ControlId, colorStopId: string, color: Color) {
		const control = this.getControl(controlId) as ColorControl
		const colorStop = control.gradient.find((colorStop) => colorStop.id === colorStopId)
		if (!colorStop) return
		colorStop.color = color

		this.updateControlOutput(controlId)
	}

	setControlSignalEase(controlId: ControlId, ease: Ease) {
		const control = this.getControl(controlId)
		if (control.type === 'number' || control.type === 'color') {
			if (control.signal?.type === 'number') {
				control.signal.ease = ease
			}
		}

		this.updateControlOutput(controlId)
	}

	setControlSignalBooster(controlId: ControlId, signalFunctionConfig: SignalFunctionConfig) {
		const control = this.getControl(controlId)
		if (control.type === 'number' || control.type === 'color') {
			if (control.signal?.type === 'number') {
				const boosterSignal = this.createBoosterSignal(
					controlId,
					signalFunctionConfig
				) as BooleanSignal
				control.signal.booster = boosterSignal
			}
		}

		this.updateControlOutput(controlId)
	}

	deleteControlSignalBooster(controlId: ControlId) {
		const control = this.getControl(controlId)
		if (control.type === 'number' || control.type === 'color') {
			if (control.signal?.type === 'number') {
				control.signal.booster = undefined
			}
		}

		this.updateControlOutput(controlId)
	}

	setControlSignalBehaviour(controlId: ControlId, behaviour: SignalBehaviour) {
		const control = this.getControl(controlId)
		if (control.type === 'number' || control.type === 'color') {
			if (control.signal?.type === 'number') {
				control.signal.behaviour = behaviour
			}
		}

		this.updateControlOutput(controlId)
	}

	setControlSignalFunction(controlId: ControlId, signalFunctionConfig: SignalFunctionConfig) {
		const control = this.getControl(controlId)

		if (control.type === 'number') {
			this.setNumberControlSignal(controlId, signalFunctionConfig)
		} else if (control.type === 'color') {
			this.setColorControlSignal(controlId, signalFunctionConfig)
		} else {
			return
		}
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
