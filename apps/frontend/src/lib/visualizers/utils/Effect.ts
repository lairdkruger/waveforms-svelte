import { OrthographicCamera, Scene, Vector2, Texture, WebGLRenderer, ShaderMaterial } from 'three'
import PingPongRenderTarget from './PingPongRenderTarget'
import Triag from './Triag'
import { effectsFragmentShader, type EffectsMaterialUniforms } from '../materials/effectsMaterial'

export default class Effect {
	scene: Scene
	camera: OrthographicCamera
	renderer: WebGLRenderer
	pingpong: PingPongRenderTarget
	quad: Triag
	uniforms: EffectsMaterialUniforms

	constructor(renderer: WebGLRenderer) {
		this.scene = new Scene()
		this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.0001, 100000)
		this.renderer = renderer

		const resolution = new Vector2()
		const size = renderer.getDrawingBufferSize(resolution)

		this.pingpong = new PingPongRenderTarget(size.width, size.height)

		this.uniforms = {
			source: { value: this.pingpong.write.texture },
			amount: { value: 0 }
		}

		this.quad = new Triag(this.renderer, null, effectsFragmentShader, this.uniforms)
		this.scene.add(this.quad)
	}

	render(sourceTexture: Texture) {
		const material = this.quad.material as ShaderMaterial
		material.uniforms.source.value = sourceTexture
		material.uniforms.amount.value = this.uniforms.amount.value

		this.quad.texture = this.pingpong.read.texture
		this.renderer.setRenderTarget(this.pingpong.write)

		this.renderer.render(this.scene, this.camera)
		this.renderer.setRenderTarget(null)

		this.pingpong.swap()

		return this.pingpong.write.texture
	}
}
