import { getContext, setContext } from 'svelte'
import AudioAnalyzer from '../audio/AudioAnalyzer'
import Controls from '../controls/Controls'
import Midi from '../midi/Midi'

interface VisualizerContext {
	audioAnalyzer: AudioAnalyzer
	midi: Midi
	controls: Controls
}

export function createVisualizerContext(key?: any) {
	const contextKey = key || 'visualizer'

	const audioAnalyzer = new AudioAnalyzer()
	const midi = new Midi()
	const controls = new Controls('visualizer', audioAnalyzer, midi)

	return setContext<VisualizerContext>(contextKey, {
		audioAnalyzer,
		midi,
		controls
	})
}

export function getVisualizerContext(key?: any): VisualizerContext {
	const contextKey = key || 'visualizer'
	const context = getContext<VisualizerContext>(contextKey)
	return context
}
