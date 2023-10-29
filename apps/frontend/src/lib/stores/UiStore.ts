import { browser } from '$app/environment'
import { writable } from 'svelte/store'

export const uiHidden = writable(false)

export function createFullScreen() {
	const { subscribe, set } = writable(false)

	function enterFullScreenMode() {
		if (!browser) return
		if (!document.fullscreenElement) {
			document.documentElement
				.requestFullscreen()
				.then(() => {
					set(true)
				})
				.catch((err) => {
					console.error(err)
					set(false)
				})
		}
	}

	function exitFullScreenMode() {
		if (!browser) return
		if (document.fullscreenElement) {
			document
				.exitFullscreen()
				.then(() => {
					set(false)
				})
				.catch((err) => {
					console.error(err)
					set(true)
				})
		}
	}

	return {
		subscribe,
		enterFullScreenMode,
		exitFullScreenMode
	}
}

export const fullScreen = createFullScreen()
