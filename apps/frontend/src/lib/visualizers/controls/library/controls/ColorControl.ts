import { derived, writable, type Readable, type Writable, get } from 'svelte/store'
import Control from './Control'
import type { ControlId, ControlOptions, ColorControlConfig, ColorOutput, Color } from '../../types'

export default class ColorControl extends Control {
	config: Writable<ColorControlConfig>
	output: Readable<ColorOutput>

	constructor(id: ControlId, options: ControlOptions, config?: Partial<ColorControlConfig>) {
		super('color', id, options)

		this.config = writable(this.populateConfig(config))
		this.output = derived(this.config, ($config) => this.deriveOutput($config))

		// Force ordering of gradient on any changes
		this.config.subscribe((config) => {
			config.gradient = config.gradient.sort((a, b) => a.coord - b.coord)
		})
	}

	populateConfig(config?: Partial<ColorControlConfig>) {
		const defaultConfig: ColorControlConfig = {
			signal: undefined,
			defaultValue: 1,
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{ id: '1', coord: 1, color: [1, 1, 1] }
			],
			ease: 'in',
			behaviour: 'straight',
			booster: undefined
		}

		return { ...defaultConfig, ...config }
	}

	deriveOutput(config: ColorControlConfig): ColorOutput {
		if (config.signal) {
			const output = config.signal?.function.output
			const color: Color = [1, 0, 0]
			return () => color
			// return get(output)
		}

		return () => [0, 1, 0]
	}
}
