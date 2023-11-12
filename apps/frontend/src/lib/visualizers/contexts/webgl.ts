import { getContext, setContext } from 'svelte'
import { get, writable, type Writable } from 'svelte/store'
import { WebGLRenderer, PerspectiveCamera, Scene, Vector2, Clock } from 'three'
import Persistance from '../canvas/primitives/Persistance'
import RenderTarget from '../canvas/primitives/RenderTarget'
import Screen from '../canvas/primitives/Screen'
import PostEffect from '../canvas/primitives/PostEffect'

type WebglFrameCallback = ({ elapsedTime }: { elapsedTime: number }) => void

interface WebglContext {
	scene: Writable<Scene | null>
	backgroundScene: Writable<Scene | null>
	camera: Writable<PerspectiveCamera | null>
	renderer: Writable<WebGLRenderer | null>
	persistance: Writable<Persistance | null>
	postEffect: Writable<PostEffect | null>
	initWebgl: (canvas: HTMLCanvasElement) => void
	onFrame: (callback: WebglFrameCallback) => void
}

export function createWebglContext(key?: any) {
	const contextKey = key || 'webgl'

	let sceneCurrent: Writable<Scene | null> = writable(null)
	let backgroundSceneCurrent: Writable<Scene | null> = writable(null)
	let cameraCurrent: Writable<PerspectiveCamera | null> = writable(null)
	let rendererCurrent: Writable<WebGLRenderer | null> = writable(null)
	let renderTargetCurrent: Writable<RenderTarget | null> = writable(null)

	let persistanceCurrent: Writable<Persistance | null> = writable(null)
	let postEffectCurrent: Writable<PostEffect | null> = writable(null)
	let screenCurrent: Writable<Screen | null> = writable(null)

	let callbacks: WebglFrameCallback[] = []
	const clock = new Clock()

	function onResize() {
		const camera = get(cameraCurrent)
		const renderer = get(rendererCurrent)

		if (!camera || !renderer) return null
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
	}

	function init(canvas: HTMLCanvasElement) {
		sceneCurrent.set(new Scene())
		backgroundSceneCurrent.set(new Scene())
		cameraCurrent.set(
			new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		)
		rendererCurrent.set(
			new WebGLRenderer({
				// Most performant settings when using custom post-processing persistance
				canvas: canvas,
				antialias: false,
				alpha: false,
				powerPreference: 'high-performance',
				stencil: false,
				depth: false
			})
		)

		const camera = get(cameraCurrent)
		camera?.position.set(0, 0, 5)

		const renderer = get(rendererCurrent)
		renderer!.setPixelRatio(window.devicePixelRatio)
		renderer!.setSize(window.innerWidth, window.innerHeight)
		renderer!.setClearColor(0x000000, 0)

		const size = new Vector2()
		renderer!.getSize(size)

		renderTargetCurrent.set(new RenderTarget(size.width, size.height))

		const backgroundScene = get(backgroundSceneCurrent)
		persistanceCurrent.set(new Persistance(renderer!, backgroundScene!))
		postEffectCurrent.set(new PostEffect(renderer!))
		screenCurrent.set(new Screen(renderer!))

		// Events
		window.addEventListener('resize', onResize)

		// Animate
		loop()
	}

	function onFrame(callback: WebglFrameCallback) {
		callbacks.push(callback)
	}

	function render() {
		let camera = get(cameraCurrent)
		let scene = get(sceneCurrent)
		let backgroundScene = get(backgroundSceneCurrent)
		let renderer = get(rendererCurrent)
		let renderTarget = get(renderTargetCurrent)
		let screen = get(screenCurrent)

		let persistance = get(persistanceCurrent)
		let postEffect = get(postEffectCurrent)

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
		scene: sceneCurrent,
		backgroundScene: backgroundSceneCurrent,
		camera: cameraCurrent,
		renderer: rendererCurrent,
		persistance: persistanceCurrent,
		postEffect: postEffectCurrent,
		initWebgl: (canvas: HTMLCanvasElement) => init(canvas),
		onFrame
	})
}

export function getWebglContext(key?: any): WebglContext {
	const contextKey = key || 'webgl'
	const context = getContext(contextKey) as WebglContext
	return context
}
