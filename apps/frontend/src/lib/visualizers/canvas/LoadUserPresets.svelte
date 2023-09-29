<script lang="ts">
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { getVisualizerContext } from '../contexts/visualizer'
	import type { CurrentControlConfigs } from '../controls/types/presets'
	import Signal from '../controls/library/signals/Signal'
	import type { ControlConfig, ControlId, SignalConfig } from '../controls/types'

	const userPresets = $page.data.userPresets
	const { controls, audioAnalyzer, midi } = getVisualizerContext()
	const presets = controls.presets.presets

	$: console.log(userPresets)

	onMount(() => {
		if (!userPresets) return
		for (const preset of userPresets) {
			// Escape if preset already exists
			if ($presets[preset.id]) return

			// Escape if schema type is not string
			if (typeof preset.schema !== 'string') return

			const userControls = JSON.parse(preset.schema) as CurrentControlConfigs
			const controlConfigs: Record<ControlId, ControlConfig> = {}

			// Function lookups
			// Replace signal configs and booster configs with real signals
			for (const [controlId, config] of Object.entries(userControls)) {
				// @ts-ignore
				controlConfigs[controlId] = config

				if (config.signal) {
					let booster: Signal | undefined = undefined

					if (config.signal.booster) {
						if (config.signal.booster.context === 'audio') {
							const boosterConfig: SignalConfig = {
								behaviour: config.signal.booster.behaviour,
								ease: config.signal.ease,
								booster: undefined
							}

							const baseSignal = audioAnalyzer.signals[config.signal.booster.id]
							booster = new Signal(
								baseSignal.context,
								baseSignal.id,
								baseSignal.defaultFunction,
								baseSignal.range,
								boosterConfig
							)
						} else if (config.signal.booster.context === 'midi') {
							const boosterConfig: SignalConfig = {
								behaviour: config.signal.booster.behaviour,
								ease: config.signal.ease,
								booster: undefined
							}

							// Midi signals dont pre-exist, so we need to create them
							midi.createMidiSignal(config.signal.booster.id)

							const baseSignal = midi.signals[config.signal.booster.id]
							booster = new Signal(
								baseSignal.context,
								baseSignal.id,
								baseSignal.defaultFunction,
								baseSignal.range,
								boosterConfig
							)
						}
					}

					if (config.signal.context === 'audio') {
						const signalConfig: SignalConfig = {
							behaviour: config.signal.behaviour,
							ease: config.signal.ease,
							booster: booster
						}

						const baseSignal = audioAnalyzer.signals[config.signal.id]
						controlConfigs[controlId].signal = new Signal(
							baseSignal.context,
							baseSignal.id,
							baseSignal.defaultFunction,
							baseSignal.range,
							signalConfig
						)
					} else if (config.signal.context === 'midi') {
						const signalConfig: SignalConfig = {
							behaviour: config.signal.behaviour,
							ease: config.signal.ease,
							booster: booster
						}

						// Midi signals dont pre-exist, so we need to create them
						midi.createMidiSignal(config.signal.id)

						const baseSignal = midi.signals[config.signal.id]
						controlConfigs[controlId].signal = new Signal(
							baseSignal.context,
							baseSignal.id,
							baseSignal.defaultFunction,
							baseSignal.range,
							signalConfig
						)
					}
				}
			}

			controls.loadUserPreset(preset, controlConfigs)
		}
	})
</script>
