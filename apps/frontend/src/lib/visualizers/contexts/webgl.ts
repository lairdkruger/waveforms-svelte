import { getContext, setContext } from 'svelte'
import { get, writable, type Writable } from 'svelte/store'
import { WebGLRenderer, PerspectiveCamera, Scene, Vector2 } from 'three'
import Effect from '../utils/Effect'
import RenderTarget from '../utils/RenderTarget'
import Screen from '../utils/Screen'

interface WebglContext {
	scene: Writable<Scene | null>
	camera: Writable<PerspectiveCamera | null>
	renderer: Writable<WebGLRenderer | null>
	effects: Writable<Effect | null>
	initWebgl: (canvas: HTMLCanvasElement) => void
	onFrame: (callback: () => void) => void
}

export function createWebglContext(key?: any) {
	const contextKey = key || 'webgl'

	let sceneCurrent: Writable<Scene | null> = writable(null)
	let cameraCurrent: Writable<PerspectiveCamera | null> = writable(null)
	let rendererCurrent: Writable<WebGLRenderer | null> = writable(null)
	let renderTargetCurrent: Writable<RenderTarget | null> = writable(null)

	let effectsCurrent: Writable<Effect | null> = writable(null)
	let screenCurrent: Writable<Screen | null> = writable(null)

	let callbacks: (() => void)[] = []

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
		cameraCurrent.set(
			new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		)
		rendererCurrent.set(
			new WebGLRenderer({
				// Most performant settings when using custom post-processing effects
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

		effectsCurrent.set(new Effect(renderer!))
		screenCurrent.set(new Screen(renderer!))

		// Events
		window.addEventListener('resize', onResize)

		// Animate
		loop()
	}

	function onFrame(callback: () => void) {
		callbacks.push(callback)
	}

	function render() {
		let camera = get(cameraCurrent)
		let scene = get(sceneCurrent)
		let renderer = get(rendererCurrent)
		let renderTarget = get(renderTargetCurrent)
		let screen = get(screenCurrent)

		let effects = get(effectsCurrent)

		// Render the scene into render target
		if (!renderer || !scene || !camera || !renderTarget || !effects || !screen) return null
		renderer.setRenderTarget(renderTarget)
		renderer.render(scene, camera)
		renderer.setRenderTarget(null)

		// Render the effects
		let result = effects.render(renderTarget.texture)

		// Render the screen
		screen.render(result)
	}

	function loop() {
		callbacks.forEach((callback) => callback())
		render()
		requestAnimationFrame(loop)
	}

	return setContext<WebglContext>(contextKey, {
		scene: sceneCurrent,
		camera: cameraCurrent,
		renderer: rendererCurrent,
		effects: effectsCurrent,
		initWebgl: (canvas: HTMLCanvasElement) => init(canvas),
		onFrame
	})
}

export function getWebglContext(key?: any): WebglContext {
	const contextKey = key || 'webgl'
	const context = getContext(contextKey) as WebglContext
	return context
}
