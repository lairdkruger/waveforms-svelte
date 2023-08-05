export type Color = [number, number, number]

export type ColorStop = {
	id: string
	coord: number // Position on gradient [0...1]
	color: [number, number, number] // [R, G, B]
}
