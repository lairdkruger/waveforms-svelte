import { getContext, setContext } from 'svelte'
import { WebGLRenderer, PerspectiveCamera, Scene, Vector2, Clock } from 'three'
import Persistance from '../canvas/primitives/Persistance'
import RenderTarget from '../canvas/primitives/RenderTarget'
import Screen from '../canvas/primitives/Screen'
import PostEffect from '../canvas/primitives/PostEffect'

type WebglFrameCallback = ({ elapsedTime }: { elapsedTime: number }) => void

interface WebglContext {
	scene: Scene | null
	backgroundScene: Scene | null
	camera: PerspectiveCamera | null
	renderer: WebGLRenderer | null
	persistance: Persistance | null
	postEffect: PostEffect | null
	initWebgl: (canvas: HTMLCanvasElement) => void
	onFrame: (callback: WebglFrameCallback) => void
}

export function createWebglContext(key?: any) {
	const contextKey = key || 'webgl'

	let scene: Scene | null = $state(null)
	let backgroundScene: Scene | null = $state(null)
	let camera: PerspectiveCamera | null = $state(null)
	let renderer: WebGLRenderer | null = $state(null)
	let renderTarget: RenderTarget | null = $state(null)

	let persistance: Persistance | null = $state(null)
	let postEffect: PostEffect | null = $state(null)
	let screen: Screen | null = $state(null)

	let callbacks: WebglFrameCallback[] = []
	const clock = new Clock()

	function onResize() {
		if (!camera || !renderer) return null
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
	}

	function init(canvas: HTMLCanvasElement) {
		scene = new Scene()
		backgroundScene = new Scene()
		camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		renderer = new WebGLRenderer({
			// Most performant settings when using custom post-processing persistance
			canvas: canvas,
			antialias: false,
			alpha: false,
			powerPreference: 'high-performance',
			stencil: false,
			depth: false
		})

		camera?.position.set(0, 0, 5)

		renderer!.setPixelRatio(window.devicePixelRatio)
		renderer!.setSize(window.innerWidth, window.innerHeight)
		renderer!.setClearColor(0x000000, 0)

		const size = new Vector2()
		renderer!.getSize(size)

		renderTarget = new RenderTarget(size.width, size.height)

		persistance = new Persistance(renderer!, backgroundScene!)
		postEffect = new PostEffect(renderer!)
		screen = new Screen(renderer!)

		// Events
		window.addEventListener('resize', onResize)

		// Animate
		loop()
	}

	function onFrame(callback: WebglFrameCallback) {
		callbacks.push(callback)
	}

	function render() {
		// Render the scene into render target
		if (
			!renderer ||
			!scene ||
			!camera ||
			!renderTarget ||
			!persistance ||
			!screen ||
			!backgroundScene ||
			!postEffect
		) {
			return null
		}

		renderer.setRenderTarget(renderTarget)
		renderer.render(scene, camera)
		renderer.setRenderTarget(null)

		// Render the persistance
		let { sceneTexture, backgroundTexture } = persistance.render(renderTarget.texture)
		let postTexture = postEffect.render(sceneTexture)

		// Render the screen
		screen.render(postTexture, backgroundTexture)
	}

	function loop() {
		let elapsedTime = clock.getElapsedTime()

		callbacks.forEach((callback) => callback({ elapsedTime }))
		render()
		requestAnimationFrame(loop)
	}

	return setContext<WebglContext>(contextKey, {
		get scene() {
			return scene
		},
		get backgroundScene() {
			return backgroundScene
		},
		get camera() {
			return camera
		},
		get renderer() {
			return renderer
		},
		get persistance() {
			return persistance
		},
		get postEffect() {
			return postEffect
		},
		initWebgl: (canvas: HTMLCanvasElement) => init(canvas),
		onFrame
	})
}

export function getWebglContext(key?: any): WebglContext {
	const contextKey = key || 'webgl'
	const context = getContext(contextKey) as WebglContext
	return context
}
