<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { type Group, Color } from 'three'
	import { MeshLine, MeshLineGeometry, MeshLineMaterial } from '@lume/three-meshline'
	import { distributeAngles, map, radians } from '$lib/visualizers/utils/Maths'
	import WaveLineClone from './WaveLineClone.svelte'
	import type { Color as ColorType } from '$lib/visualizers/controls/types'

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
		'wavelineShape',
		{
			label: 'Shape',
			group: group
		},
		{ values: ['Line', 'Circle'] },
		{ defaultValue: 'Circle' }
	)

	const lineType = controls.createSelectControl(
		'wavelineType',
		{
			label: 'Type',
			group: group
		},
		{ values: ['Spectrum', 'Waveform', 'Wavetrum'] },
		{ defaultValue: 'Waveform' }
	)

	const lineIntensity = controls.createNumberControl(
		'wavelineIntensity',
		{
			label: 'Intensity',
			group: group
		},
		{ defaultValue: 1, range: [0, 20] }
	)

	const lineSize = controls.createNumberControl(
		'wavelineSize',
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
		'wavelinePositionX',
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
		'wavelinePositionY',
		{
			label: 'Position Y',
			group: group
		},
		{
			defaultValue: 0,
			range: [-5, 5]
		}
	)

	const linePositionZ = controls.createNumberControl(
		'wavelinePositionZ',
		{
			label: 'Position Z',
			group: group
		},
		{
			defaultValue: 0,
			range: [-5, 5]
		}
	)

	const rotationX = controls.createNumberControl(
		'wavelineRotationX',
		{
			label: 'Rotation X',
			group: group
		},
		{
			defaultValue: 0,
			range: [-1, 1]
		},
		{ transformer: (value) => value * Math.PI }
	)

	const rotationY = controls.createNumberControl(
		'wavelineRotationY',
		{
			label: 'Rotation Y',
			group: group
		},
		{
			defaultValue: 0,
			range: [-1, 1]
		},
		{ transformer: (value) => value * Math.PI }
	)

	const rotationZ = controls.createNumberControl(
		'wavelineRotationZ',
		{
			label: 'Rotation Z',
			group: group
		},
		{
			defaultValue: 0,
			range: [-1, 1]
		},
		{ transformer: (value) => value * Math.PI }
	)

	const lineDirection = controls.createSelectControl(
		'wavelineDirection',
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
		'wavelineResolution',
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
		'wavelineSymmetry',
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
		'wavelineThickness',
		{
			label: 'Thickness',
			group: group
		},
		{
			defaultValue: 1,
			range: [0, 10]
		},
		{ transformer: (value) => value / 100 }
	)

	const lineColor = controls.createColorControl(
		'wavelineColor',
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

	const maxClones = 120
	const clones = controls.createNumberControl(
		'wavelineClones',
		{
			label: 'Clones',
			group: group
		},
		{
			defaultValue: 0,
			range: [0, maxClones]
		},
		{ transformer: (value) => Math.round(value), rangeReadOnly: true }
	)

	const cloneSpacing = controls.createNumberControl(
		'wavelineCloneSpacing',
		{
			label: 'Clone Spacing',
			group: group
		},
		{
			defaultValue: 0.02,
			range: [0, 1]
		}
	)

	const flowShape = controls.createBooleanControl(
		'wavelineFlowShape',
		{
			label: 'Flow Shape',
			group: group
		},
		{ defaultValue: 1 }
	)

	const flowColors = controls.createBooleanControl(
		'wavelineFlowColors',
		{
			label: 'Flow Colors',
			group: group
		},
		{ defaultValue: 1 }
	)

	// Components
	const geometry = new MeshLineGeometry()
	const materialColor = new Color(initialColor)
	// @ts-ignore
	const material = new MeshLineMaterial({
		color: materialColor,
		lineWidth: $lineThickness(),
		sizeAttenuation: true
	})
	const meshline = new MeshLine(geometry, material)

	// Points
	const audioResolution = Math.round(Math.log(audioAnalyzer.fft) / Math.log(2))

	let numPoints = 16
	numPoints = Math.pow(2, audioResolution) / 2 / 2

	const points: Point[] = new Array(numPoints)
	const pointPositions: number[][] = []
	let pointsArray: number[] = new Array(numPoints * 3).fill(0)
	const pointsArrayHistory: number[][] = new Array(maxClones + 1).fill(null)
	const colorHistory: ColorType[] = new Array(maxClones + 1).fill(materialColor)

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

		pointsArray = pointPositions.flat()
		meshline.geometry.setPoints(pointsArray)

		// Shuffle points history
		if ($flowShape()) {
			for (let i = maxClones; i > 0; i--) {
				pointsArrayHistory[i] = pointsArrayHistory[i - 1]
			}
		}

		pointsArrayHistory[0] = pointsArray
	}

	function updateLineProperties() {
		meshline.material.uniforms.lineWidth.value = $lineThickness()
		materialColor.set(...$lineColor())

		// Shuffle color history
		if ($flowColors()) {
			for (let i = maxClones; i > 0; i--) {
				colorHistory[i] = colorHistory[i - 1]
			}
		}
		colorHistory[0] = $lineColor()

		meshline.material.uniforms.color.value = materialColor

		meshline.material.uniformsNeedUpdate = true
	}

	function updateGroup() {
		parent.position.set($linePositionX(), $linePositionY(), $linePositionZ())
		parent.rotation.set($rotationX(), $rotationY(), $rotationZ())
	}

	onFrame(() => {
		updateLinePoints()
		updateLineProperties()
		updateGroup()
	})

	// Clones
	const clonesArray = new Array(maxClones).fill(null)

	$: if (parent) {
		parent.add(meshline)
	}

	onDestroy(() => {
		parent.remove(meshline)
	})
</script>

{#each clonesArray as _, index}
	<WaveLineClone
		{parent}
		{index}
		{clones}
		{cloneSpacing}
		{pointsArrayHistory}
		{colorHistory}
		{flowShape}
		{flowColors}
		{lineShape}
		{lineThickness}
	/>
{/each}
