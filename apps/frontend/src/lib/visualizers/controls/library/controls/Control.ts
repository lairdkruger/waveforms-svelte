import type { ControlId, ControlOptions, ControlType } from '../../types'

export default class Control {
	type
	id
	options

	constructor(type: ControlType, id: ControlId, options: ControlOptions) {
		this.type = type
		this.id = id

		const populatedOptions = this.populateOptions(options)
		this.options = populatedOptions
	}

	populateOptions(options: ControlOptions) {
		const defaultOptions: Partial<ControlOptions> = {
			label: this.id,
			folder: this.id,
			group: this.id
		}

		return { ...defaultOptions, ...options }
	}
}
