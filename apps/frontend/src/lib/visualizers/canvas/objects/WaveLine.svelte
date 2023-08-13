<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { onDestroy } from 'svelte'
	import { BoxGeometry, MeshBasicMaterial, type Group, Mesh, Color, Vector3 } from 'three'
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

	const { controls, audioAnalyzer } = getVisualizerContext()
	const { onFrame, scene } = getWebglContext()

	const geometry = new MeshLineGeometry()
	const materialColor = new Color(0x000000)
	// @ts-ignore
	const material = new MeshLineMaterial({
		color: materialColor,
		lineWidth: 0.1,
		sizeAttenuation: false
	})
	const meshline = new MeshLine(geometry, material)

	// Points
	const audioResolution = Math.round(Math.log(audioAnalyzer.fft) / Math.log(2))

	const numPoints = Math.pow(2, audioResolution)
	const points: Point[] = new Array(numPoints)
	const pointPositions: number[][] = []

	function createLine() {
		// Populate line array with points
		const length = 6

		for (let i = 0; i < numPoints; i++) {
			const angle = radians(distributeAngles(i, numPoints)) + Math.PI / 2

			const particle: Point = {
				x: map(i, 0, numPoints - 1, -length / 2, length / 2),
				y: 0,
				z: 0,
				angle: angle
			}

			points[i] = particle
		}
	}

	createLine()

	const folder = controls.createFolder(label, { label: label })
	const group = controls.createGroup(label, {
		folder: folder,
		label: label
	})

	const lineType = controls.createSelectControl(
		'lineType',
		{
			label: 'Type',
			folder: folder
		},
		{ values: ['Spectrum', 'Waveform', 'Wavetrum'] },
		{ defaultValue: 'Spectrum' }
	)

	const lineDirection = controls.createSelectControl(
		'lineDirection',
		{
			label: 'Direction',
			folder: folder
		},
		{ values: ['Parallel', 'Perpendicular'] },
		{ defaultValue: 'Parallel' }
	)

	function audioSymmetryTransformer(value: number) {
		const symmetries = [1, 2, 4, 6, 8, 12, 16, 32]
		return symmetries[Math.round(value) - 1]
	}

	const lineSymmetry = controls.createNumberControl(
		'lineSymmetry',
		{
			label: 'Symmetry',
			folder: folder
		},
		{ defaultValue: 2, range: [1, 8] },
		{
			rangeReadOnly: true, // Only allow [1, 2, 4, 6, 8, 10, 12, 14, 16] for symmetry
			transformer: audioSymmetryTransformer
		}
	)

	function audioResolutionTransformer(value: number) {
		return value < 2 ? 1 : 2 ** Math.round(value)
	}

	const lineResolution = controls.createNumberControl(
		'lineResolution',
		{
			label: 'Resolution',
			folder: folder
		},
		{ defaultValue: 1, range: [1, 8] },
		{
			rangeReadOnly: true,
			// Only allow values that are powers of 2 for resolution (1, 2, 4, 8, 16, etc.)
			transformer: audioResolutionTransformer
		}
	)

	const lineThickness = controls.createNumberControl(
		'lineThickness',
		{
			label: 'Thickness',
			folder: folder
		},
		{ defaultValue: 1, range: [0, 10] },
		{ transformer: (value) => value / 100 }
	)

	const lineIntensity = controls.createNumberControl(
		'lineIntensity',
		{
			label: 'Intensity',
			folder: folder
		},
		{ defaultValue: 5, range: [0, 10] }
	)

	const lineColor = controls.createColorControl(
		'lineColor',
		{
			label: 'Color',
			folder: folder
		},
		{
			defaultValue: 0,
			gradient: [
				{ id: '0', coord: 0, color: [0, 0, 0] },
				{ id: '1', coord: 1, color: [1, 1, 1] }
			]
		}
	)

	// Update line graphic to use current line data
	function updateLine() {
		const symmetry = $lineSymmetry()

		// Shorten line resolution as symmetry increases and segments become shorter
		const lineSegmentShortener = Math.max(symmetry / 2, 1)

		// Construct sorted array of indexes indicating where the symmetry segments begin and end
		const symmetrySegments: [number, number][] = []
		for (let s = 0; s < symmetry; s++) {
			symmetrySegments.push([
				Math.round(numPoints / symmetry) * s,
				Math.round((numPoints / symmetry) * (s + 1))
			])
		}

		// Loop through point while maintaining linear sequence, but apply mirrored line data based on symmetry array
		for (let i = 0; i < symmetrySegments.length; i++) {
			for (let j = symmetrySegments[i][0]; j < symmetrySegments[i][1]; j += $lineResolution()) {
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
				for (let k = 0; k < $lineResolution(); k++) {
					const pointIndex = j + k
					const point = points[pointIndex]
					if (!point) continue

					// Update xy positions if direction is set to parallel
					const x = point.x

					const y =
						$lineDirection() === 'Parallel'
							? point.y + audioValue * $lineIntensity()
							: point.y

					// Update z position if direction is set to perpendicular
					const z =
						$lineDirection() === 'Perpendicular'
							? point.z + audioValue * $lineIntensity()
							: point.z

					pointPositions[pointIndex] = [x, y, z] // use z coord instead
				}
			}
		}

		meshline.geometry.setPoints(pointPositions.flat())

		meshline.material.uniforms.lineWidth.value = $lineThickness()
		materialColor.set(...$lineColor())
		meshline.material.uniforms.color.value = materialColor

		meshline.material.uniformsNeedUpdate = true
	}

	onFrame(() => {
		updateLine()
	})

	$: if (parent) {
		parent.add(meshline)
	}

	onDestroy(() => {
		parent.remove(meshline)
	})
</script>
