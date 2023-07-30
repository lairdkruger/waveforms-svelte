import { camelcase } from '../utils/Strings'

export type MidiDeviceId = string // Format midiDeviceName
export type MidiControlId = string // Format [midiControlNumber]-[SignalType]_[Midi-Device-Name]
export type MidiEventType = 'note' | 'control' // Notes contain note on/off events, control types are simple
export type MidiNoteEventType = 'noteOn' | 'noteOff'

export default class Midi {
	midiAccess: MIDIAccess | null = null
	listening = false
	recentInput: MidiControlId | null = null
	activeInput: MidiControlId | null = null

	signalFunctions: { [key: string]: any } = {}

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

	createMidiSignalFunctionId(controlId: MidiControlId) {
		return `get${controlId}`
	}

	// Opposite of createMidiSignalFunctionId
	createMidiControlId(signalFunctionId: string) {
		// Removes the 'get' prefix
		return signalFunctionId.slice(3)
	}

	createSignalFunction(signalFunctionId: string, midiControlId: MidiControlId) {
		const signalFunction = {
			context: 'midi',
			type: 'number',
			id: signalFunctionId,
			output: () => this[midiControlId]
		}

		this.signalFunctions[signalFunction.id] = signalFunction

		return signalFunction
	}

	// Add a midi input to the store
	addMidiInput(midiControlId: MidiControlId) {
		// Append a new midi control signal to the state
		this[midiControlId] = 0

		// Create a new signalFunctionId
		const signalFunctionId = this.createMidiSignalFunctionId(midiControlId)

		// Create a new signalFunction and append it to the state
		this.createSignalFunction(signalFunctionId, midiControlId)

		this.listening = false
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
			if (!(midiControlId in this)) {
				this.addMidiInput(midiControlId)
			}
		}

		// Normalize input value
		const value = this.normalizeMidiValue(message.data)

		// Update existing midi control value
		if (midiControlId in this) {
			this[midiControlId] = value
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
			this.listening = true

			const interval = setInterval(() => {
				console.log('checking for new input')

				// Periodically check for a new input
				const newInput = this.recentInput

				console.log(newInput, this)

				if (newInput) {
					console.log('New input detected" ', newInput)

					// Once a new input is detected return it's signal function id
					const controlSignalFunctionId = this.createMidiSignalFunctionId(newInput)
					// Stop listening
					this.listening = false

					clearInterval(interval)
					resolve(controlSignalFunctionId)
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
		this.listening = false
	}

	// Manually create a midi signal function (eg: loading presets)
	createMidiSignalFunction(signalFunctionId: string) {
		const midiControlId = this.createMidiControlId(signalFunctionId)
		// Append a new midi control signal to the state
		this[midiControlId] = 0

		// Create a new signalFunction from existing id and append it to the state
		const signalFunction = this.createSignalFunction(signalFunctionId, midiControlId)
		return signalFunction
	}
}