import { browser } from '$app/environment'
import { HalfFloatType, LinearFilter } from 'three'
import RenderTarget from './RenderTarget'

// create 2 render targets to swap
export default class PingPongRenderTarget {
	renderTargetA: RenderTarget
	renderTargetB: RenderTarget

	constructor(w = 512, h = 512) {
		this.renderTargetA = new RenderTarget(w, h)
		this.renderTargetB = new RenderTarget(w, h)

		// FBO Settings
		this.renderTargetA.texture.minFilter = LinearFilter
		this.renderTargetB.texture.minFilter = LinearFilter
		this.renderTargetA.texture.type = HalfFloatType
		this.renderTargetB.texture.type = HalfFloatType

		if (browser) {
			window.addEventListener('resize', () => {
				this.setSize(window.innerWidth, window.innerHeight)
			})
		}
	}

	setSize(w: number, h: number) {
		this.renderTargetA.setSize(w, h)
		this.renderTargetA.texture.needsUpdate = true
		this.renderTargetB.setSize(w, h)
		this.renderTargetB.texture.needsUpdate = true
	}

	swap() {
		let temp = this.renderTargetA
		this.renderTargetA = this.renderTargetB
		this.renderTargetB = temp
	}

	get read() {
		return this.renderTargetA
	}

	get write() {
		return this.renderTargetB
	}
}
