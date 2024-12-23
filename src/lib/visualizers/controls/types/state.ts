import type { Ease } from '$lib/visualizers/utils/CubicBezier'
import type { Writable } from 'svelte/store'
import type {
	BooleanControlConfig,
	ColorControlConfig,
	ControlConfig,
	NumberControlConfig,
	SelectControlConfig
} from './configs'
import type { Control, ControlId, NumberControlSettings } from './controllers'
import type { ColorOutput, NumberOutput, SelectOutput } from './functions'
import type { ControlOptions, Folder, FolderOptions, Group, GroupOptions } from './structure'
import type { PresetId } from './presets'
import type { Color, ColorStop } from './primitives'
import type { SignalBehaviour, SignalConfig } from './signals'
import type { Preset as PresetDb } from 'supabase'
import type Preset from '../library/presets/Preset'
import type Signal from '../library/signals/Signal'
import type { MidiControlId } from '$lib/visualizers/midi/Midi'

export interface ControlsInternals {
	_clientStateReady: boolean
}

export interface ControlsStates {
	draggedSignal: SignalConfig | null
	draggedSignalTarget: string | null
	controlPanelRef: Writable<HTMLDivElement | null>
	dragStartCoord: [number, number]
	dragMouseCoords: [number, number]
}

export interface ControlsSingletons {
	singletons: {
		visualizerSlug: string
	}
}

export interface ControlsActions {
	internalActions: {
		setClientStateReady: (value: boolean) => void
	}

	actions: {
		// State Setters
		setdraggedSignal: (signalFunction: SignalConfig | null) => void
		setDraggedSignalTarget: (control: Control | null) => void
		setDragStartCoord: (coord: [number, number]) => void
		setDragMouseCoords: (coord: [number, number]) => void

		// Utilities
		resetInteractions: () => void
		createSignalId: (controlId: ControlId, signalId?: string) => string
		createSignal: (controlId: ControlId, config?: ControlConfig) => Signal | null

		// Control Functions
		deleteConnection: (controlId: ControlId) => void
		updateControlOutput: (controlId: ControlId) => void

		// Control Constructors
		createFolder: (id: string, options?: FolderOptions) => string
		createGroup: (id: string, options?: GroupOptions) => string
		createStructure: (id: string, options?: ControlOptions) => void

		createBooleanControl: (
			id: string,
			options?: ControlOptions,
			config?: BooleanControlConfig
		) => NumberOutput
		createNumberControl: (
			id: string,
			options?: ControlOptions,
			config?: NumberControlConfig,
			settings?: NumberControlSettings
		) => NumberOutput
		createSelectControl: (
			id: string,
			options: ControlOptions,
			config: SelectControlConfig
		) => SelectOutput
		createColorControl: (
			id: string,
			options?: ControlOptions,
			config?: ColorControlConfig
		) => ColorOutput

		// Control Setters
		setBooleanControlValue: (controlId: ControlId, value: 0 | 1) => void
		setBooleanControlSignal: (controlId: ControlId, signalFunctionConfig: SignalConfig) => void

		setNumberControlValue: (controlId: ControlId, value: number) => void
		setNumberControlUpperRange: (controlId: ControlId, value: number) => void
		setNumberControlLowerRange: (controlId: ControlId, value: number) => void
		setNumberControlSignal: (controlId: ControlId, signalFunctionConfig: SignalConfig) => void
		setSelectControlValue: (controlId: ControlId, value: string) => void

		setColorControlValue: (controlId: ControlId, value: number) => void
		setColorControlSignal: (controlId: ControlId, signalFunctionConfig: SignalConfig) => void
		setColorControlColorCoord: (controlId: ControlId, colorStopId: string, value: number) => void
		colorControlAddColorStop: (controlId: ControlId, colorStop: ColorStop) => void
		colorControlRemoveColorStop: (controlId: ControlId, colorStopId: string) => void
		colorControlSetColorStopColor: (
			controlId: ControlId,
			colorStopId: string,
			color: Color
		) => void

		setControlSignalEase: (controlId: ControlId, ease: Ease) => void
		setControlSignalBooster: (controlId: ControlId, signalFunctionConfig: SignalConfig) => void
		deleteControlSignalBooster: (controlId: ControlId) => void
		setControlSignalBehaviour: (controlId: ControlId, behaviour: SignalBehaviour) => void
		setControlSignal: (controlId: ControlId, signalFunctionConfig: SignalConfig) => void

		// Getters
		getControlsInGroup: (controlsIds: string[], groupId: string) => string[]

		// Presets
		createPreset: (presetId: string, configs: Record<string, ControlConfig>) => void
		changePreset: (presetId: string) => void
		loadUserPreset: (preset: PresetDb) => void
		setPresetMidiBinding: (presetId: PresetId, midiControlId: MidiControlId) => void
	}
}

export interface Controls {
	folders: Record<string, Folder>
	groups: Record<string, Group>
	controls: Record<string, Control>
}

export interface Presets {
	preset: Writable<PresetId>
	presets: Writable<Record<PresetId, Preset>>
}

export interface ControlsState
	extends ControlsInternals,
		ControlsStates,
		ControlsActions,
		ControlsSingletons {
	controls: Controls
	presets: Presets
}
