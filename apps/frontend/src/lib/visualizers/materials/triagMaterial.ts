import type { Texture, Vector2 } from 'three'

export interface TriagMaterialUniforms {
	diffuse: { value: Texture | null }
	background: { value: Texture | null }
	uResolution: { value: Vector2 }
}

export const triagVertexShader = /* glsl */ `
	precision highp float;

	attribute vec2 position;

	void main() {
		// Because triag is a fullscreen triangle, we don't need to multiply
		// It's already in clip space coordinates since its visible area is [-1...1]
		gl_Position = vec4(position, 1.0, 1.0);
	}
`

export const triagFragmentShader = /* glsl */ `
	precision highp float;

	uniform sampler2D diffuse;
	uniform sampler2D background;

	uniform vec2 uResolution;


	void main() {
		vec2 uv = gl_FragCoord.xy / uResolution.xy;

		vec4 scene = texture2D(diffuse, uv);
		vec4 background = texture2D(background, uv);

		// Overlay the scene over the background
		vec4 fragColor = mix(background, scene, scene.a);

		gl_FragColor = fragColor;
	}
`
