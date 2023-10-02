import type { Ticker } from '../controls/types'

export function map(value: number, min1: number, max1: number, min2: number, max2: number) {
	if (min1 === max1 || isNaN(value)) return min1 // No dividing by zero allowed
	return ((value - min1) / (max1 - min1)) * (max2 - min2) + min2
}

export function lerp(v0: number, v1: number, t: number) {
	return v0 * (1 - t) + v1 * t
}

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value))
}

export function radians(deg: number) {
	return (deg * Math.PI) / 180
}

export function degrees(rad: number) {
	return (rad * 180) / Math.PI
}

export function degreesToPoint(deg: number, diameter: number) {
	const rad = (Math.PI * deg) / 180
	const r = diameter / 2
	return { x: r * Math.cos(rad), y: r * Math.sin(rad) }
}

export function distributeAngles(me: number, total: number) {
	return (me / (total - 1)) * 360
}

export function halfDistributeAngles(me: number, total: number) {
	return (me / (total - 1)) * 180
}

export function quarterDistributeAngles(me: number, total: number) {
	return (me / (total - 1)) * 90
}

export function random(min: number, max: number) {
	return Math.random() * (max - min) + min
}

// Returns the two clostest values in a sorted array that is closest to the input value
export function closest2(number: number, numbers: number[]) {
	const value = numbers.reduce((prev, curr) => {
		return Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev
	})
	const greaterThan = number > value // is the closest found value greater than the target value
	const index = numbers.indexOf(value)

	// Out of range cases
	if (greaterThan && index + 1 >= numbers.length) return [index, index]
	if (!greaterThan && index - 1 < 0) return [index, index]

	return greaterThan ? [index, index + 1] : [index - 1, index]
}

export function lerpColors(
	colors: [[number, number, number], [number, number, number]],
	mix: number
) {
	let color: [number, number, number] = [0, 0, 0]

	// Loop through and lerp each value of [R, G, B] to mix value
	for (let i = 0; i < 3; i++) {
		color[i] = lerp(colors[0][i], colors[1][i], mix)
	}

	return color
}

export function triangleWave(value: number, period: number, amplitude: number, speed: number) {
	const y = (amplitude / period) * (period - Math.abs((value % (2 * period)) - period))
	const ticker = (value += speed / 1000)

	return [y, ticker]
}

export function mapPingPong(speed: number, ticker: Ticker) {
	const period = 24
	const amplitude = 1

	let [y, tick] = triangleWave(ticker.value, period, amplitude, speed)
	ticker.value = tick

	return y
}

export function mapLoop(speed: number, ticker: Ticker) {
	if (ticker.value > 1) ticker.value = 0
	ticker.value += speed / 1000

	return ticker.value
}
