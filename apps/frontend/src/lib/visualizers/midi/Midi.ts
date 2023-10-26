import { camelcase } from '$lib/visualizers/utils/Strings'
import { writable } from 'svelte/store'
import Signal from '../controls/library/signals/Signal'

export type MidiDeviceId = string // Format midiDeviceName
export type MidiControlId = string // Format [midiControlNumber]-[SignalType]_[Midi-Device-Name]
export type MidiEventType = 'note' | 'control' // Notes contain note on/off events, control types are simple
export type MidiNoteEventType = 'noteOn' | 'noteOff'

export default class Midi {
	midiAccess: MIDIAccess | null = null
	listening = writable(false)
	recentInput: MidiControlId | null = null
	activeInput: MidiControlId | null = null

	primitives: { [key: string]: number } = {} // [midiControlId]: currentValue
	signalFunctions: { [key: string]: () => number } = {} // [signalFunctionId]: getPrimitive
	signals: { [key: string]: Signal } = {}

	constructor() {
		this.requestMidiAccess()
	}

	async requestMidiAccess() {
		if ('requestMIDIAccess' in navigator) {
			this.midiAccess = await navigator.requestMIDIAccess()
		}

		if (this.midiAccess) {
			// Listen to every input of every devices
			this.midiAccess.inputs.forEach((input) => {
				input.onmidimessage = (message) => {
					this.handleMidiMessage(message)
				}
			})
		}
	}

	getMidiEventType(event: number): MidiEventType {
		if (event >= 128 && event <= 159) {
			return 'note'
		} else {
			return 'control'
		}
	}

	getMidiNoteEventType(event: number): MidiNoteEventType {
		if (event >= 128 && event <= 143) {
			return 'noteOff'
		} else {
			return 'noteOn'
		}
	}

	// Construct midiControlId from midi message
	constructMidiControlId(message: MIDIMessageEvent): MidiControlId {
		const event = message.data[0]
		const eventType = this.getMidiEventType(event)
		const controlNumber = message.data[1]
		// @ts-expect-error
		const midiDeviceName = camelcase(message.currentTarget?.name)
		const midiControlId = `${controlNumber}_${eventType}_${midiDeviceName}`

		return midiControlId
	}

	createMidiSignalId(controlId: MidiControlId) {
		return `get${controlId}`
	}

	// Opposite of createMidiSignalId
	createMidiControlId(signalFunctionId: string) {
		// Removes the 'get' prefix
		return signalFunctionId.slice(3)
	}

	createSignal(signalFunctionId: string, midiControlId: MidiControlId) {
		this.signalFunctions[signalFunctionId] = () => this.primitives[midiControlId]

		const signal = new Signal('midi', signalFunctionId, this.signalFunctions[signalFunctionId], [
			() => 0,
			() => 1
		])

		this.signals[signalFunctionId] = signal
		return this.signals[signalFunctionId]
	}

	// Add a midi input to the store
	addMidiInput(midiControlId: MidiControlId) {
		// Append a new midi control signal to the state
		this.primitives[midiControlId] = 0

		// Create a new signalFunctionId
		const signalFunctionId = this.createMidiSignalId(midiControlId)

		// Create a new signalFunction and append it to the state
		this.createSignal(signalFunctionId, midiControlId)

		this.listening.set(false)
	}

	// Handle midiData and return a normalized value
	normalizeMidiValue(midiData: [number, number, number]) {
		const event = midiData[0]
		const value = midiData[2]

		let normalizedValue = 0

		const eventType = this.getMidiEventType(event)

		if (eventType === 'note') {
			// Handle note type events
			const noteEventType = this.getMidiNoteEventType(event)
			if (noteEventType === 'noteOff') {
				normalizedValue = 0
			} else if (noteEventType === 'noteOn') {
				normalizedValue = 1
			}
		} else {
			// Handle control change number type events
			normalizedValue = value / 127
		}

		// Normalized value must always be between 0-1
		return normalizedValue
	}

	handleMidiMessage(message: any) {
		const midiControlId = this.constructMidiControlId(message)

		// Handle new midi control setup
		if (this.listening) {
			if (!(midiControlId in this.primitives)) {
				this.addMidiInput(midiControlId)
			}
		}

		// Normalize input value
		const value = this.normalizeMidiValue(message.data)

		// Update existing midi control value
		if (midiControlId in this.primitives) {
			this.primitives[midiControlId] = value
		}

		// Set helper state: activeInput
		if (value === 1) {
			this.activeInput = midiControlId
		} else {
			this.activeInput = null
		}

		// Set helper state: recentInput
		this.recentInput = midiControlId
	}

	// API functions
	// A promise function that listens for midi input, and returns the id of a signal function
	listenForMidiInput(): Promise<string | null> {
		return new Promise((resolve, reject) => {
			// Reset recent input to null
			this.recentInput = null

			// Start listening
			this.listening.set(true)

			const interval = setInterval(() => {
				// Periodically check for a new input
				const newInput = this.recentInput

				if (newInput) {
					// Once a new input is detected return it's signal function id
					const controlSignalId = this.createMidiSignalId(newInput)
					// Stop listening
					this.listening.set(false)

					clearInterval(interval)
					resolve(controlSignalId)
				}

				// Handle case where listening is cancelled
				if (!this.listening) {
					clearInterval(interval)
					reject('Listening cancelled')
				}
			}, 100)
		})
	}

	// Cancel listening for midi input
	cancelListenForMidiInput() {
		this.listening.set(false)
	}

	// Manually create a midi signal function (eg: loading presets)
	createMidiSignal(signalFunctionId: string) {
		const midiControlId = this.createMidiControlId(signalFunctionId)
		this.addMidiInput(midiControlId)

		// Create a new signalFunction from existing id and append it to the state
		const signal = this.createSignal(signalFunctionId, midiControlId)
		return signal
	}
}
