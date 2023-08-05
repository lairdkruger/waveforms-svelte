import type { PresetConfigs, PresetId, PresetOptions } from '../../types/presets'

export default class Preset {
	id
	options
	configs: PresetConfigs
	midiBinding: string | null

	constructor(
		id: PresetId,
		options: Partial<PresetOptions>,
		configs: PresetConfigs,
		midiBinding?: string | null
	) {
		this.id = id

		const populatedOptions = this.populateOptions(options)
		this.options = populatedOptions

		this.configs = configs

		this.midiBinding = midiBinding ?? null
	}

	populateOptions(options: Partial<PresetOptions>) {
		const defaultOptions: PresetOptions = {
			label: 'Preset'
		}

		return { ...defaultOptions, ...options }
	}

	// populateConfigs(defaultConfigs: Record<ControlId, ControlConfig>, presetConfigs: PresetConfigs) {
	// 	let configs: Record<ControlId, ControlConfig> = {}

	// 	// Loop through all controls
	// 	for (const [controlId, controlConfig] of Object.entries(defaultConfigs)) {
	// 		// Fetch corresponding preset config
	// 		const presetConfig = presetConfigs[controlId]

	// 		// Merge control config with preset config
	// 		const mergedConfig = { ...controlConfig, ...presetConfig }

	// 		// Add the merged config to the configs object
	// 		configs[controlId] = mergedConfig
	// 	}

	// 	return configs

	// Create a new control with the merged config
	// if (control.type === 'boolean') {
	// 	let configStore = control.config as Writable<BooleanControlConfig>
	// 	let config = get(configStore) as BooleanControlConfig

	// 	// If specified, merge the control's config with the preset's config
	// 	if (Object.keys(configs).includes(controlId)) {
	// 		const presetConfig = configs[controlId] as BooleanControlConfig
	// 		config = { ...config, ...presetConfig }
	// 	}

	// 	const booleanControl = new BooleanControl(controlId, control.options, config)
	// 	controls[controlId] = booleanControl
	// }

	// 	controls[controlId] = control
	// }

	// return controls
	// }
}
