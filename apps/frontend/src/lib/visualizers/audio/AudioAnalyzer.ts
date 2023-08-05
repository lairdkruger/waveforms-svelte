import Signal from '../controls/library/signals/Signal'
import { map } from '../utils/Maths'

export type AudioInput = 'microphone' | 'browser'

export default class AudioAnalyzer {
	audioContext
	audioAnalyzer
	audioMediaStream: MediaStream | null = null
	audioSource: MediaStreamAudioSourceNode | null = null

	// Variables
	fft = 2048
	smoothing = 0.8
	audioInput: AudioInput = 'microphone'

	// Constants
	spectrumMultiplier = 1 / 1024 // Multiply spectrum data by this value to normalize to waveform intensity (eyeballed value)
	volumePeakedThreshold = 10
	bassPeakedThreshold = 30
	midsPeakedThreshold = 10
	highsPeakedThreshold = 10

	// Dynamics
	spectrum: Uint8Array = new Uint8Array(this.fft / 2)
	waveform: Float32Array = new Float32Array(this.fft / 2)
	spectrumLength = this.fft / 2
	volumeFrequencyRange = [Math.floor((this.fft / 2) * 0), Math.ceil((this.fft / 2) * 0.8)]
	bassFrequencyRange = [Math.floor((this.fft / 2) * 0), Math.ceil((this.fft / 2) * 0.01)]
	midsFrequencyRange = [Math.floor((this.fft / 2) * 0.13), Math.ceil((this.fft / 2) * 0.2)]
	highsFrequencyRange = [Math.floor((this.fft / 2) * 0.7), Math.ceil((this.fft / 2) * 0.8)]

	// Signals
	volume = 0
	peakVolume = 0
	volumePeaked: 0 | 1 = 0

	bassVolume = 0
	peakBassVolume = 0
	bassPeaked: 0 | 1 = 0

	midsVolume = 0
	peakMidsVolume = 0
	midsPeaked: 0 | 1 = 0

	highsVolume = 0
	peakHighsVolume = 0
	highsPeaked: 0 | 1 = 0

	///////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////
	constructor() {
		this.audioContext = new AudioContext()
		this.audioAnalyzer = this.audioContext.createAnalyser()
		this.audioAnalyzer.fftSize = this.fft
		this.audioAnalyzer.smoothingTimeConstant = this.smoothing

		this.changeAudioInput(this.audioInput)
	}

	///////////////////////////////////////////////
	// Utility Functions
	///////////////////////////////////////////////
	async handleAudioInputChange(audioInput: AudioInput) {
		// Remove existing sources
		if (this.audioSource) this.audioSource.disconnect()

		if (audioInput === 'microphone') {
			// Use microphone
			try {
				this.audioMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
			} catch (err) {
				console.error(err)
			}
		} else if (audioInput === 'browser') {
			// Use browser audio
			try {
				this.audioMediaStream = await navigator.mediaDevices.getDisplayMedia({
					video: true, // Audio only requests are not allowed
					audio: true
					// systemAudio: 'include'
				})
			} catch (err) {
				console.error(err)
			}
		}

		if (!this.audioMediaStream) return

		// Connect media stream to audio analyzer
		this.audioSource = this.audioContext.createMediaStreamSource(this.audioMediaStream)
		this.audioSource.connect(this.audioAnalyzer)
	}

	changeAudioInput(audioInput: AudioInput) {
		this.audioInput = audioInput
		this.handleAudioInputChange(audioInput)
	}

	changeFFT(fft: number) {
		if (!(Math.log2(fft) % 1 === 0 && fft >= 32 && fft <= 32768)) return
		this.fft = fft
		this.audioAnalyzer.fftSize = fft

		this.spectrum = new Uint8Array(fft / 2)
		this.waveform = new Float32Array(fft / 2)
		this.spectrumLength = fft / 2
		this.volumeFrequencyRange = [Math.floor((fft / 2) * 0), Math.ceil((fft / 2) * 0.8)]
		this.bassFrequencyRange = [Math.floor((fft / 2) * 0), Math.ceil((fft / 2) * 0.01)]
		this.midsFrequencyRange = [Math.floor((fft / 2) * 0.13), Math.ceil((fft / 2) * 0.2)]
		this.highsFrequencyRange = [Math.floor((fft / 2) * 0.7), Math.ceil((fft / 2) * 0.8)]
	}

	changeSmoothing(smoothing: number) {
		if (!(smoothing >= 0 && smoothing <= 1)) return
		this.smoothing = smoothing
		this.audioAnalyzer.smoothingTimeConstant = smoothing
	}

	///////////////////////////////////////////////
	// Analyzer Functions
	///////////////////////////////////////////////
	analyzeVolumes(accuracy = 1) {
		// Loop through and add up spectrum intensities
		// Overall
		let rms = 0
		let rmsCount = 0
		// Bass
		let rmsBass = 0
		let rmsBassCount = 0
		// Mids
		let rmsMids = 0
		let rmsMidsCount = 0
		// Highs
		let rmsHighs = 0
		let rmsHighsCount = 0

		// Loop through overall interest range of frequency domain array
		for (
			let i = this.volumeFrequencyRange[0];
			i < this.volumeFrequencyRange[1];
			i += Math.floor(accuracy)
		) {
			// Overall rms
			rms += this.spectrum[i] * this.spectrum[i]
			rmsCount++

			// Bass rms
			if (i > this.bassFrequencyRange[0] && i < this.bassFrequencyRange[1]) {
				rmsBass += this.spectrum[i] * this.spectrum[i]
				rmsBassCount++
			}

			// Mids rms
			if (i > this.midsFrequencyRange[0] && i < this.midsFrequencyRange[1]) {
				rmsMids += this.spectrum[i] * this.spectrum[i]
				rmsMidsCount++
			}

			// Highs rms
			if (i > this.highsFrequencyRange[0] && i < this.highsFrequencyRange[1]) {
				rmsHighs += this.spectrum[i] * this.spectrum[i]
				rmsHighsCount++
			}
		}

		// Calculate RMS for each range
		this.volume = Math.sqrt(rms / rmsCount)
		this.bassVolume = Math.sqrt(rmsBass / rmsBassCount)
		this.midsVolume = Math.sqrt(rmsMids / rmsMidsCount)
		this.highsVolume = Math.sqrt(rmsHighs / rmsHighsCount)

		// Calculate if ranges have peaked
		this.volumePeaked = this.volume > this.peakVolume - this.volumePeakedThreshold ? 1 : 0
		this.bassPeaked = this.bassVolume > this.peakBassVolume - this.bassPeakedThreshold ? 1 : 0
		this.midsPeaked = this.midsVolume > this.peakMidsVolume - this.midsPeakedThreshold ? 1 : 0
		this.highsPeaked = this.highsVolume > this.peakHighsVolume - this.highsPeakedThreshold ? 1 : 0

		// Track peak volumes
		this.peakVolume = this.volume > this.peakVolume ? this.volume : this.peakVolume
		this.peakBassVolume =
			this.bassVolume > this.peakBassVolume ? this.bassVolume : this.peakBassVolume
		this.peakMidsVolume =
			this.midsVolume > this.peakMidsVolume ? this.midsVolume : this.peakMidsVolume
		this.peakHighsVolume =
			this.highsVolume > this.peakHighsVolume ? this.highsVolume : this.peakHighsVolume

		// Constantly decrease peak volumes to keep things fresh
		// Mapping a slower fall in quieter moments (customised to characteristics of each range eg: snares rms typically quiter)
		this.peakVolume = this.peakVolume - map(this.volume, 0, 150, 0.005, 0.04)
		this.peakBassVolume = this.peakBassVolume - map(this.bassVolume, 0, 150, 0.005, 0.04)
		this.peakMidsVolume = this.peakMidsVolume - map(this.midsVolume, 0, 150, 0.005, 0.04)
		this.peakHighsVolume = this.peakHighsVolume - map(this.highsVolume, 0, 150, 0.005, 0.04)
	}

	analyzeSpectrum(volumeAccuracy: number) {
		this.audioAnalyzer.getByteFrequencyData(this.spectrum)
		this.analyzeVolumes(volumeAccuracy)

		// Return spectrum data to caller
		return this.spectrum
	}

	analyzeWaveform() {
		this.audioAnalyzer.getFloatTimeDomainData(this.waveform)

		// Return waveform data to caller
		return this.waveform
	}

	mapSpectrum(index: number, min: number, max: number, shortener: number | undefined) {
		const spectrumShortener = shortener || 1

		const valueBand = Math.floor(
			map(index, min, max, 0, this.spectrum.length / spectrumShortener - 1)
		)

		let value = this.spectrum[valueBand]
		return value
	}

	mapWaveform(index: number, min: number, max: number, shortener: number | undefined) {
		const waveformShortener = shortener || 1

		const valueBand = Math.floor(
			map(index, min, max, 0, this.waveform.length / waveformShortener - 1)
		)

		let value = this.waveform[valueBand]
		return value
	}

	///////////////////////////////////////////////
	// Getters
	///////////////////////////////////////////////
	getVolume() {
		return this.volume
	}

	getPeakVolume() {
		return this.peakVolume
	}

	getVolumePeaked() {
		return this.volumePeaked
	}

	getBassVolume() {
		return this.bassVolume
	}

	getPeakBassVolume() {
		return this.peakBassVolume
	}

	getBassPeaked() {
		return this.bassPeaked
	}

	getMidsVolume() {
		return this.midsVolume
	}

	getPeakMidsVolume() {
		return this.peakMidsVolume
	}

	getMidsPeaked() {
		return this.midsPeaked
	}

	getHighsVolume() {
		return this.highsVolume
	}

	getPeakHighsVolume() {
		return this.peakHighsVolume
	}

	getHighsPeaked() {
		return this.highsPeaked
	}

	signals: Record<string, Signal> = {
		getVolume: new Signal('audio', 'getVolume', () => this.getVolume(), [
			() => 0,
			() => this.getPeakVolume()
		]),
		getVolumePeaked: new Signal('audio', 'getVolumePeaked', () => this.getVolumePeaked(), [
			() => 0,
			() => 1
		]),
		getBassVolume: new Signal('audio', 'getBassVolume', () => this.getBassVolume(), [
			() => 0,
			() => this.getPeakBassVolume()
		]),
		getBassPeaked: new Signal('audio', 'getBassPeaked', () => this.getBassPeaked(), [
			() => 0,
			() => 1
		]),
		getMidsVolume: new Signal('audio', 'getMidsVolume', () => this.getMidsVolume(), [
			() => 0,
			() => this.getPeakMidsVolume()
		]),
		getMidsPeaked: new Signal('audio', 'getMidsPeaked', () => this.getMidsPeaked(), [
			() => 0,
			() => 1
		]),
		getHighsVolume: new Signal('audio', 'getHighsVolume', () => this.getHighsVolume(), [
			() => 0,

			() => this.getPeakHighsVolume()
		]),
		getHighsPeaked: new Signal('audio', 'getHighsPeaked', () => this.getHighsPeaked(), [
			() => 0,
			() => 1
		])
	}

	getSignals() {
		return this.signals
	}
}
