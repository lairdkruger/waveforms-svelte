import { OrthographicCamera, Scene, Vector2, Texture, WebGLRenderer, ShaderMaterial } from 'three'
import Triag from './Triag'
import {
	postEffectFragmentShader,
	postEffectVertexShader,
	type PostEffectMaterialUniforms
} from '../../materials/postEffectMaterial'
import RenderTarget from './RenderTarget'
import { browser } from '$app/environment'

export default class PostEffect {
	scene: Scene
	camera: OrthographicCamera
	renderer: WebGLRenderer
	renderTarget: RenderTarget
	quad: Triag
	uniforms: PostEffectMaterialUniforms

	constructor(renderer: WebGLRenderer) {
		this.scene = new Scene()
		this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 100)
		this.renderer = renderer

		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		this.renderTarget = new RenderTarget(size.width, size.height)

		if (browser) {
			window.addEventListener('resize', () => {
				this.onResize(renderer)
			})
		}

		this.uniforms = {
			source: { value: new Texture() },
			uResolution: { value: size },
			segments: { value: 2 },
			rotation: { value: 0 },
			movement: { value: 0 },
			radius: { value: 0 },
			squeeze: { value: 0 },
			loops: { value: 0 }
		}

		this.quad = new Triag(
			this.renderer,
			null,
			null,
			postEffectVertexShader,
			postEffectFragmentShader,
			this.uniforms
		)

		this.scene.add(this.quad)
	}

	render(sourceTexture: Texture) {
		const material = this.quad.material as ShaderMaterial
		material.uniforms.source.value = sourceTexture
		material.uniforms.segments.value = this.uniforms.segments.value
		material.uniforms.rotation.value = this.uniforms.rotation.value
		material.uniforms.movement.value = this.uniforms.movement.value
		material.uniforms.radius.value = this.uniforms.radius.value
		material.uniforms.squeeze.value = this.uniforms.squeeze.value
		material.uniforms.loops.value = this.uniforms.loops.value

		this.quad.texture = sourceTexture

		this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		this.renderer.setRenderTarget(null)

		return this.renderTarget.texture
	}

	onResize(renderer: WebGLRenderer) {
		if (!this.camera || !this.renderer) return null
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		this.renderTarget.setSize(size.width, size.height)
		this.renderTarget.texture.needsUpdate = true
	}
}
