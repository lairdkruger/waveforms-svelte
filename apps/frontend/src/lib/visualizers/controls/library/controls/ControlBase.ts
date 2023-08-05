import type { ControlId, ControlOptions, ControlType } from '../../types'

export default class ControlBase {
	type
	id
	options

	constructor(type: ControlType, id: ControlId, options?: Partial<ControlOptions>) {
		this.type = type
		this.id = id

		const populatedOptions = this.populateOptions(options)
		this.options = populatedOptions
	}

	populateOptions(options?: Partial<ControlOptions>) {
		const defaultOptions: ControlOptions = {
			label: this.id,
			folder: this.id,
			group: this.id
		}

		return { ...defaultOptions, ...options }
	}
}
