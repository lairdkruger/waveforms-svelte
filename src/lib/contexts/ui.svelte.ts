import { browser } from '$app/environment'
import { getContext, setContext } from 'svelte'

interface UiContext {
	uiHidden: boolean
	toggleUiHidden: () => void
	fullscreen: boolean
	enterFullScreenMode: () => void
	exitFullScreenMode: () => void
}

export function createUiContext(key: string | undefined = 'default') {
	// Context key
	key = 'ui' + key

	let uiHidden = $state(false)
	let fullscreen = $state<boolean>(false)

	function toggleUiHidden() {
		uiHidden = !uiHidden
	}

	function enterFullScreenMode() {
		if (!browser) return
		if (!document.fullscreenElement) {
			document.documentElement
				.requestFullscreen()
				.then(() => {
					fullscreen = true
				})
				.catch((err) => {
					console.error(err)
					fullscreen = false
				})
		}
	}

	function exitFullScreenMode() {
		if (!browser) return
		if (document.fullscreenElement) {
			document
				.exitFullscreen()
				.then(() => {
					fullscreen = false
				})
				.catch((err) => {
					console.error(err)
					fullscreen = true
				})
		}
	}

	// Create consumable context
	return setContext<UiContext>(key, {
		get uiHidden() {
			return uiHidden
		},
		toggleUiHidden,
		get fullscreen() {
			return fullscreen
		},
		enterFullScreenMode,
		exitFullScreenMode
	})
}

export function getUiContext(key: string | undefined = 'default'): UiContext {
	const context = getContext('ui' + key) as UiContext
	return context
}
