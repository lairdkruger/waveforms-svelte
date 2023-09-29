import { browser } from '$app/environment'
import { HalfFloatType, LinearFilter, Vector2, WebGLRenderer } from 'three'
import RenderTarget from './RenderTarget'

// create 2 render targets to swap
export default class PingPongRenderTarget {
	renderTargetA: RenderTarget
	renderTargetB: RenderTarget

	constructor(renderer: WebGLRenderer) {
		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		this.renderTargetA = new RenderTarget(size.width, size.height)
		this.renderTargetB = new RenderTarget(size.width, size.height)

		// FBO Settings
		this.renderTargetA.texture.minFilter = LinearFilter
		this.renderTargetB.texture.minFilter = LinearFilter
		this.renderTargetA.texture.type = HalfFloatType
		this.renderTargetB.texture.type = HalfFloatType

		if (browser) {
			window.addEventListener('resize', () => {
				this.onResize(renderer)
			})
		}
	}

	onResize(renderer: WebGLRenderer) {
		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		this.renderTargetA.setSize(size.width, size.height)
		this.renderTargetA.texture.needsUpdate = true
		this.renderTargetB.setSize(size.width, size.height)
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
