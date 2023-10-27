<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { type Group, Color } from 'three'
	import { MeshLine, MeshLineGeometry, MeshLineMaterial } from '@lume/three-meshline'
	import { distributeAngles, map, radians } from '$lib/visualizers/utils/Maths'

	// Type declarations
	type Point = {
		x: number
		y: number
		z: number
		angle: number
	}

	export let parent: Group
	export let label: string
	export let initialColor = new Color(0xffffff)

	const { controls, audioAnalyzer } = getVisualizerContext()
	const { onFrame } = getWebglContext()

	const folder = controls.createFolder(label, { label: label })
	const group = controls.createGroup(label, {
		folder: folder,
		label: label
	})

	// Controls
	const lineShape = controls.createSelectControl(
		'lineShape',
		{
			label: 'Shape',
			group: group
		},
		{ values: ['Line', 'Circle'] },
		{ defaultValue: 'Circle' }
	)

	const lineType = controls.createSelectControl(
		'lineType',
		{
			label: 'Type',
			group: group
		},
		{ values: ['Spectrum', 'Waveform', 'Wavetrum'] },
		{ defaultValue: 'Waveform' }
	)

	const lineIntensity = controls.createNumberControl(
		'lineIntensity',
		{
			label: 'Intensity',
			group: group
		},
		{ defaultValue: 12, range: [0, 20] }
	)

	const lineSize = controls.createNumberControl(
		'lineSize',
		{
			label: 'Size',
			group: group
		},
		{
			defaultValue: 2,
			range: [1, 5]
		}
	)

	const linePositionX = controls.createNumberControl(
		'linePositionX',
		{
			label: 'Position X',
			group: group
		},
		{
			defaultValue: 0,
			range: [-5, 5]
		}
	)

	const linePositionY = controls.createNumberControl(
		'linePositionY',
		{
			label: 'Position Y',
			group: group
		},
		{
			defaultValue: 0,
			range: [-5, 5]
		}
	)

	const lineDirection = controls.createSelectControl(
		'lineDirection',
		{
			label: 'Direction',
			group: group
		},
		{ values: ['Parallel', 'Perpendicular'] },
		{ defaultValue: 'Parallel' }
	)

	function audioResolutionTransformer(value: number) {
		return value < 2 ? 1 : 2 ** Math.round(value)
	}

	const lineResolution = controls.createNumberControl(
		'lineResolution',
		{
			label: 'Resolution',
			group: group
		},
		{ defaultValue: 1, range: [8, 1] },
		{
			rangeReadOnly: true,
			// Only allow values that are powers of 2 for resolution (1, 2, 4, 8, 16, etc.)
			transformer: audioResolutionTransformer
		}
	)

	function audioSymmetryTransformer(value: number) {
		const symmetries = [1, 2, 4, 6, 8, 12, 16, 32]
		return symmetries[Math.round(value) - 1]
	}

	const lineSymmetry = controls.createNumberControl(
		'lineSymmetry',
		{
			label: 'Symmetry',
			group: group
		},
		{ defaultValue: 2, range: [1, 8] },
		{
			rangeReadOnly: true, // Only allow [1, 2, 4, 6, 8, 10, 12, 14, 16] for symmetry
			transformer: audioSymmetryTransformer
		}
	)

	const lineThickness = controls.createNumberControl(
		'lineThickness',
		{
			label: 'Thickness',
			group: group
		},
		{
			defaultValue: 0.5,
			range: [0, 10]
		},
		{ transformer: (value) => value / 100 }
	)

	const lineColor = controls.createColorControl(
		'lineColor',
		{
			label: 'Color',
			group: group
		},
		{
			defaultValue: 0.5,
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{
					id: '0.5',
					coord: 0.5,
					color: [
						initialColor.toArray()[0],
						initialColor.toArray()[1],
						initialColor.toArray()[2]
					]
				},
				{ id: '1', coord: 1, color: [1, 1, 1] }
			]
		}
	)

	// Components
	const geometry = new MeshLineGeometry()
	const materialColor = new Color(initialColor)
	// @ts-ignore
	const material = new MeshLineMaterial({
		color: materialColor,
		lineWidth: $lineThickness(),
		sizeAttenuation: false
	})
	const meshline = new MeshLine(geometry, material)

	// Points
	const audioResolution = Math.round(Math.log(audioAnalyzer.fft) / Math.log(2))

	let numPoints = 16
	numPoints = Math.pow(2, audioResolution) / 2 / 2

	const points: Point[] = new Array(numPoints)
	const pointPositions: number[][] = []

	function createLine() {
		const size = $lineSize()
		const shape = $lineShape()

		// Populate line array with points
		// Extra loop iteration to close the line
		for (let i = 0; i < numPoints; i++) {
			const angle = radians(distributeAngles(i, numPoints)) + Math.PI / 2

			const particle: Point = {
				x:
					shape === 'Circle'
						? Math.cos(angle) * size
						: map(i, 0, numPoints - 1, -length / 2, length / 2),
				y: shape === 'Circle' ? Math.sin(angle) * size : 0,
				z: 0,
				angle: angle
			}

			points[i] = particle
			pointPositions[i] = [particle.x, particle.y, particle.z]
		}
	}

	createLine() // Call once on mount

	meshline.geometry.setPoints(pointPositions.flat())

	// Update line graphic to use current line data
	function updateLinePoints() {
		const symmetry = $lineSymmetry()

		// Shorten line resolution as symmetry increases and segments become shorter
		const lineSegmentShortener = Math.max(symmetry / 2, 1)

		// Construct sorted array of indexes indicating where the symmetry segments begin and end
		const symmetrySegments: [number, number][] = []
		const symmetrySegmentLength = Math.round(numPoints / symmetry)
		for (let s = 0; s < symmetry; s++) {
			symmetrySegments.push([symmetrySegmentLength * s, symmetrySegmentLength * (s + 1) - 1])
		}

		const resolution = $lineResolution()

		// Loop through point while maintaining linear sequence, but apply mirrored line data based on symmetry array
		for (let i = 0; i < symmetrySegments.length; i++) {
			for (let j = symmetrySegments[i][0]; j <= symmetrySegments[i][1]; j += resolution) {
				let audioValue = 0

				// Reverse how the audioValue is applied for every second segment
				if (i % 2 === 0) {
					if ($lineType() === 'Spectrum') {
						audioValue =
							audioAnalyzer.mapSpectrum(
								j,
								symmetrySegments[i][0],
								symmetrySegments[i][1],
								lineSegmentShortener
							) * audioAnalyzer.spectrumMultiplier
					} else if ($lineType() === 'Waveform') {
						audioValue = audioAnalyzer.mapWaveform(
							j,
							symmetrySegments[i][0],
							symmetrySegments[i][1],
							lineSegmentShortener
						)
					} else if ($lineType() === 'Wavetrum') {
						audioValue =
							audioAnalyzer.mapSpectrum(
								j,
								symmetrySegments[i][0],
								symmetrySegments[i][1],
								lineSegmentShortener
							) *
								audioAnalyzer.spectrumMultiplier +
							audioAnalyzer.mapWaveform(
								j,
								symmetrySegments[i][0],
								symmetrySegments[i][1],
								lineSegmentShortener
							)
					}
				} else {
					if ($lineType() === 'Spectrum') {
						audioValue =
							audioAnalyzer.mapSpectrum(
								j,
								symmetrySegments[i][1],
								symmetrySegments[i][0],
								lineSegmentShortener
							) * audioAnalyzer.spectrumMultiplier
					} else if ($lineType() === 'Waveform') {
						audioValue = audioAnalyzer.mapWaveform(
							j,
							symmetrySegments[i][1],
							symmetrySegments[i][0],
							lineSegmentShortener
						)
					} else if ($lineType() === 'Wavetrum') {
						audioValue =
							audioAnalyzer.mapSpectrum(
								j,
								symmetrySegments[i][1],
								symmetrySegments[i][0],
								lineSegmentShortener
							) *
								audioAnalyzer.spectrumMultiplier +
							audioAnalyzer.mapWaveform(
								j,
								symmetrySegments[i][1],
								symmetrySegments[i][0],
								lineSegmentShortener
							)
					}
				}

				// Loop by resolution, and apply audio value accordingly (ie: into groups of vertices)
				for (let k = 0; k < resolution; k++) {
					let pointIndex = j + k
					const point = points[pointIndex]

					if (!point) continue

					point.x =
						$lineShape() === 'Circle'
							? Math.cos(point.angle) * $lineSize()
							: map(pointIndex, 0, numPoints - 1, -$lineSize(), $lineSize())

					point.y = $lineShape() === 'Circle' ? Math.sin(point.angle) * $lineSize() : 0

					// Update xy positions if direction is set to parallel
					let x = point.x
					let y = point.y
					let z = point.z

					if ($lineShape() === 'Circle') {
						x =
							$lineDirection() === 'Parallel'
								? point.x + Math.cos(point.angle) * (audioValue * $lineIntensity())
								: point.x

						y =
							$lineDirection() === 'Parallel'
								? point.y + Math.sin(point.angle) * (audioValue * $lineIntensity())
								: point.y

						z =
							$lineDirection() === 'Parallel'
								? point.z
								: point.z + audioValue * $lineIntensity()
					}

					if ($lineShape() === 'Line') {
						x = point.x

						y =
							$lineDirection() === 'Parallel'
								? point.y + audioValue * $lineIntensity()
								: point.y

						z =
							$lineDirection() === 'Parallel'
								? point.z
								: point.z + audioValue * $lineIntensity()
					}

					pointPositions[pointIndex] = [x, y, z] // use z coord instead
				}
			}
		}

		meshline.geometry.setPoints(pointPositions.flat())
	}

	function updateLineProperties() {
		meshline.material.uniforms.lineWidth.value = $lineThickness()
		materialColor.set(...$lineColor())
		meshline.material.uniforms.color.value = materialColor

		meshline.material.uniformsNeedUpdate = true

		meshline.position.set($linePositionX(), $linePositionY(), 0)
	}

	onFrame(() => {
		updateLinePoints()
		updateLineProperties()
	})

	$: if (parent) {
		parent.add(meshline)
	}

	onDestroy(() => {
		parent.remove(meshline)
	})
</script>
