import {
	Mesh,
	ShaderMaterial,
	BufferGeometry,
	Vector2,
	RawShaderMaterial,
	BufferAttribute,
	WebGLRenderer
} from 'three'
import {
	triagFragmentShader,
	triagVertexShader,
	type TriagMaterialUniforms
} from '../../materials/triagMaterial'
import { browser } from '$app/environment'

// Fullscreen triangle that renders a texure
// https://luruke.medium.com/simple-postprocessing-in-three-js-91936ecadfb7
export default class Triag extends Mesh {
	constructor(
		renderer: WebGLRenderer,
		texture = null,
		backgroundTexture = null,
		vertexShader = triagVertexShader,
		fragmentShader = triagFragmentShader,
		params = {}
	) {
		const resolution = new Vector2()
		renderer.getDrawingBufferSize(resolution)

		const uniforms: TriagMaterialUniforms = {
			diffuse: { value: texture },
			background: { value: backgroundTexture },
			uResolution: { value: resolution },
			...params
		}

		const geometry = new BufferGeometry()
		const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0])
		geometry.setAttribute('position', new BufferAttribute(vertices, 3))

		const material = new RawShaderMaterial({
			// @ts-expect-error
			uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		})

		super(geometry, material)
		this.frustumCulled = false

		if (browser) window.addEventListener('resize', () => this.onResize(renderer))
	}

	onResize(renderer: WebGLRenderer) {
		const size = new Vector2()
		renderer.getSize(size)
		size.multiplyScalar(window.devicePixelRatio)

		const material = this.material as ShaderMaterial
		material.uniforms.uResolution.value = size
		material.uniformsNeedUpdate = true
	}

	set texture(texture) {
		const material = this.material as ShaderMaterial
		material.uniforms.diffuse.value = texture
	}
	get texture() {
		const material = this.material as ShaderMaterial
		return material.uniforms.diffuse.value
	}

	set backgroundTexture(texture) {
		const material = this.material as ShaderMaterial
		material.uniforms.background.value = texture
	}
	get backgroundTexture() {
		const material = this.material as ShaderMaterial
		return material.uniforms.background.value
	}
}
