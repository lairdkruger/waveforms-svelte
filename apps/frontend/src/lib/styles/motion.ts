import type { SpringOpts } from 'svelte/motion'

export const springConfigSmooth: SpringOpts = {
	stiffness: 0.1,
	damping: 0.9,
	precision: 0.0005
}

export const springConfigExtraSmooth: SpringOpts = {
	stiffness: 0.04,
	damping: 0.94,
	precision: 0.0005
}
