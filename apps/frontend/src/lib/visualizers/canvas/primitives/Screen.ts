import { OrthographicCamera, Scene, Texture, WebGLRenderer } from 'three'
import Triag from './Triag'

export default class Screen {
	scene: Scene
	camera: OrthographicCamera
	renderer: WebGLRenderer
	screen: Triag

	constructor(renderer: WebGLRenderer) {
		this.scene = new Scene()
		this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.0001, 100000)
		this.renderer = renderer

		this.screen = new Triag(this.renderer)
		this.scene.add(this.screen)
	}

	render(sourceTexture: Texture) {
		this.screen.texture = sourceTexture
		this.renderer.render(this.scene, this.camera)
	}
}
