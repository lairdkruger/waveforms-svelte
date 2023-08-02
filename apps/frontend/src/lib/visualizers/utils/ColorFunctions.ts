import type { ColorStop } from '../controls/types'
import { clamp, map } from './Maths'

export function rgbToHex(color: [number, number, number]): string {
	let [r, g, b] = color
	let hexR = r.toString(16)
	let hexG = g.toString(16)
	let hexB = b.toString(16)

	if (hexR.length === 1) hexR = '0' + r
	if (hexG.length === 1) hexG = '0' + g
	if (hexB.length === 1) hexB = '0' + b

	return '#' + hexR + hexG + hexB
}

export function hexToRgb(color: string): [number, number, number] {
	let r = 0
	let g = 0
	let b = 0

	// 3 digits
	if (color.length === 4) {
		r = Number('0x' + color[1] + color[1])
		g = Number('0x' + color[2] + color[2])
		b = Number('0x' + color[3] + color[3])

		// 6 digits
	} else if (color.length === 7) {
		r = Number('0x' + color[1] + color[2])
		g = Number('0x' + color[3] + color[4])
		b = Number('0x' + color[5] + color[6])
	}

	return [r, g, b]
}

export function rgbToHsv(color: [number, number, number]): [number, number, number] {
	let [r, g, b] = color
	r /= 255
	g /= 255
	b /= 255

	const max = Math.max(r, g, b)
	const d = max - Math.min(r, g, b)

	const h = d
		? (max === r
				? (g - b) / d + (g < b ? 6 : 0)
				: max === g
				? 2 + (b - r) / d
				: 4 + (r - g) / d) * 60
		: 0
	const s = max ? (d / max) * 100 : 0
	const v = max * 100

	return [h, s, v]
}

export function hsvToRgb(color: [number, number, number]): [number, number, number] {
	let [h, s, v] = color
	s /= 100
	v /= 100

	const i = ~~(h / 60)
	const f = h / 60 - i
	const p = v * (1 - s)
	const q = v * (1 - s * f)
	const t = v * (1 - s * (1 - f))
	const index = i % 6

	const r = Math.round([v, q, p, p, t, v][index] * 255)
	const g = Math.round([t, v, v, q, p, p][index] * 255)
	const b = Math.round([p, p, t, v, v, q][index] * 255)

	return [r, g, b]
}

// Create a CSS linear gradient string from gradient object
export function gradientToCSS(gradient: ColorStop[]) {
	let cssLinearGradient = 'linear-gradient(90deg'

	if (gradient.length > 1) {
		// Loop through gradient colors to construct gradient
		for (const colorStop of gradient) {
			const colorStopCss = `, rgb(${[denormalizeRgb(colorStop.color)]}) ${map(
				colorStop.coord,
				0,
				1,
				0,
				100
			)}%`
			cssLinearGradient += colorStopCss
		}
	} else {
		// Case for when gradient is single color stop
		const colorStop = gradient[0]
		const colorStopCss = `, rgb(${[denormalizeRgb(colorStop.color)]}) 0% , rgb(${[
			denormalizeRgb(colorStop.color)
		]}) 100%`
		cssLinearGradient += colorStopCss
	}

	cssLinearGradient += ')'

	return cssLinearGradient
}

// Convert [0...255] to [0...1]
export function normalizeRgb(color: [number, number, number]) {
	let normalizedRgb: [number, number, number] = [0, 0, 0]

	for (let i = 0; i < color.length; i++) {
		normalizedRgb[i] = clamp(map(color[i], 0, 255, 0, 1), 0, 1)
	}

	return normalizedRgb
}

// Convert [0...1] to [0...255]
export function denormalizeRgb(color: [number, number, number]) {
	let normalizedRgb: [number, number, number] = [0, 0, 0]

	for (let i = 0; i < color.length; i++) {
		normalizedRgb[i] = Math.round(clamp(map(color[i], 0, 1, 0, 255), 0, 255))
	}

	return normalizedRgb
}
