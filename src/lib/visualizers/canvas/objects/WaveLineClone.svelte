<script lang="ts">
	import { getWebglContext } from '$lib/visualizers/contexts/webgl.svelte'
	import { onDestroy, onMount } from 'svelte'
	import { type Group, Color } from 'three'
	import { MeshLine, MeshLineGeometry, MeshLineMaterial } from '@lume/three-meshline'
	import type { Readable } from 'svelte/store'
	import type {
		NumberOutput,
		SelectOutput,
		Color as ColorType
	} from '$lib/visualizers/controls/types'

	interface Props {
		parent: Group
		index: number
		clones: NumberOutput
		cloneSpacing: NumberOutput
		pointsArrayHistory: number[][]
		colorHistory: ColorType[]
		flowShape: NumberOutput
		flowColors: NumberOutput
		lineShape: SelectOutput
		lineThickness: NumberOutput
	}

	let {
		parent,
		index,
		clones,
		cloneSpacing,
		pointsArrayHistory,
		colorHistory,
		flowShape,
		flowColors,
		lineShape,
		lineThickness
	}: Props = $props()

	const webglContext = getWebglContext()

	// Derived
	let isVisible = $derived(index < clones())
	const cloneIndex = index + 1

	// Components
	const geometry = new MeshLineGeometry()
	const materialColor = new Color(...colorHistory[0])
	// @ts-ignore
	const material = new MeshLineMaterial({
		color: materialColor,
		lineWidth: lineThickness(),
		sizeAttenuation: true
	})
	const mesh = new MeshLine(geometry, material)

	function updateLinePoints() {
		if (flowShape()) {
			if (pointsArrayHistory[cloneIndex] !== null)
				mesh.geometry.setPoints(pointsArrayHistory[cloneIndex])
		} else {
			mesh.geometry.setPoints(pointsArrayHistory[0])
		}
	}

	function updateLineProperties() {
		mesh.material.uniforms.lineWidth.value = lineThickness()

		if (flowColors()) {
			if (colorHistory[cloneIndex] !== null) materialColor.set(...colorHistory[cloneIndex])
		} else {
			materialColor.set(...colorHistory[0])
		}

		mesh.material.uniforms.color.value = materialColor
		mesh.material.uniformsNeedUpdate = true

		let scale = 1
		let offset = 0

		if (lineShape() === 'Circle') {
			scale = 1 + cloneSpacing() * cloneIndex
		}

		if (lineShape() === 'Line') {
			offset = cloneSpacing() * cloneIndex
		}

		mesh.scale.set(scale, scale, scale)
		mesh.position.set(0, offset, 0)
	}

	webglContext.onFrame(() => {
		if (!isVisible) return
		updateLinePoints()
		updateLineProperties()
	})

	// Scene and memory
	$effect(() => {
		if (parent && isVisible) {
			if (!parent.children.includes(mesh)) parent.add(mesh)
		}
	})

	function destroyClone() {
		parent.remove(mesh)
		mesh.geometry.dispose()
		geometry.dispose()
		mesh.material.dispose()
		material.dispose()
	}

	$effect(() => {
		if (parent && !isVisible) {
			if (parent.children.includes(mesh)) destroyClone()
		}
	})

	onDestroy(() => {
		destroyClone()
	})
</script>
