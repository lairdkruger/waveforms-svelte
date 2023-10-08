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
	persistanceFragmentShader,
	persistanceVertexShader,
	type PersistanceMaterialUniforms
} from '../../materials/persistanceMaterial'
import RenderTarget from './RenderTarget'
import { browser } from '$app/environment'

export default class Persistance {
	scene: Scene
	backgroundScene: Scene
	camera: OrthographicCamera
	renderer: WebGLRenderer
	pingpong: PingPongRenderTarget
	backgroundRenderTarget: RenderTarget
	quad: Triag
	uniforms: PersistanceMaterialUniforms

	constructor(renderer: WebGLRenderer, backgroundScene: Scene) {
		this.scene = new Scene()
		this.backgroundScene = backgroundScene
		this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 100)
		this.renderer = renderer

		this.pingpong = new PingPongRenderTarget(renderer)

		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		if (browser) {
			window.addEventListener('resize', () => {
				this.onResize(renderer)
			})
		}

		this.backgroundRenderTarget = new RenderTarget()

		this.uniforms = {
			source: { value: this.pingpong.write.texture },
			amount: { value: 0.8 },
			uvTransformMatrix: { value: new Matrix3() }
		}

		this.quad = new Triag(
			this.renderer,
			null,
			null,
			persistanceVertexShader,
			persistanceFragmentShader,
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

		// Finally render the background scene
		this.renderer.setRenderTarget(this.backgroundRenderTarget)
		this.renderer.render(this.backgroundScene, this.camera)
		this.renderer.setRenderTarget(null)

		return {
			sceneTexture: this.pingpong.write.texture,
			backgroundTexture: this.backgroundRenderTarget.texture
		}
	}

	onResize(renderer: WebGLRenderer) {
		if (!this.camera || !this.renderer) return null
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		this.backgroundRenderTarget.setSize(size.width, size.height)
		this.backgroundRenderTarget.texture.needsUpdate = true
	}
}
