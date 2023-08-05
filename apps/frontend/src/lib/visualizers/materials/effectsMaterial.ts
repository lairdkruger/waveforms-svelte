import type { Texture } from 'three'

export interface EffectsMaterialUniforms {
	source: { value: Texture | null }
	amount: { value: number }
}

export const effectsVertexShader = /* glsl */ `
	precision highp float;
	
	attribute vec2 position;

	void main() {
		// Because triag is a fullscreen triangle, we don't need to multiply
		// It's already in clip space coordinates since its visible area is [-1...1]
		gl_Position = vec4(position, 1.0, 1.0);
	}
`

export const effectsFragmentShader = /* glsl */ `
	precision highp float;

  	uniform sampler2D source;
	uniform sampler2D diffuse;
	uniform float amount;

	uniform vec2 uResolution;

	void main() {
		// Since we require [0...1] for UVs, we need to multiply by 2
		vec2 uv = gl_FragCoord.xy / uResolution.xy;

		// sample the source texture (the source rendertarget)
		vec4 a = texture2D(source, uv);

		// sample the input texture (pingpong input) 
		vec4 b = texture2D(diffuse, uv);
		
		float mixAmount = min(amount, 0.99);
		vec4 fragColor = mix(a, b, mixAmount);

		// blend the source texture over the feedback texture
		gl_FragColor = fragColor;
	}
`
