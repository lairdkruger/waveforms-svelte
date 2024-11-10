export type Visualizer = {
	slug: string
	name: string
	description: string
}

export const visualizerData: Visualizer[] = [
	{
		slug: 'betaform',
		name: 'Betaform',
		description: 'The classic single line visualizer - highly customisable'
	},
	{
		slug: 'primitive',
		name: 'Primitive',
		description: 'Primitive visualizer used for internal systems and feature testing'
	}
]
