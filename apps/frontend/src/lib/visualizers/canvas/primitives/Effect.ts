import {
	OrthographicCamera,
	Scene,
	Vector2,
	Texture,
	WebGLRenderer,
	ShaderMaterial,
	Matrix3
} from 'three'
import PingPongRenderTarget from './PingPongRenderTarget'
import Triag from './Triag'
import {
	effectsFragmentShader,
	effectsVertexShader,
	type EffectsMaterialUniforms
} from '../../materials/effectsMaterial'

export default class Effect {
	scene: Scene
	camera: OrthographicCamera
	renderer: WebGLRenderer
	pingpong: PingPongRenderTarget
	quad: Triag
	uniforms: EffectsMaterialUniforms

	constructor(renderer: WebGLRenderer) {
		this.scene = new Scene()
		this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 100)
		this.renderer = renderer

		this.pingpong = new PingPongRenderTarget(renderer)

		this.uniforms = {
			source: { value: this.pingpong.write.texture },
			amount: { value: 0.8 },
			uvTransformMatrix: { value: new Matrix3() }
		}

		this.quad = new Triag(
			this.renderer,
			null,
			effectsVertexShader,
			effectsFragmentShader,
			this.uniforms
		)
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

	onResize() {
		if (!this.camera || !this.renderer) return null
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}
}
