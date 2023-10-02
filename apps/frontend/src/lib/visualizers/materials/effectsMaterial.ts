import type { Matrix3, Texture } from 'three'

export interface EffectsMaterialUniforms {
	source: { value: Texture | null }
	amount: { value: number }
	uvTransformMatrix: { value: Matrix3 }
}

export const effectsVertexShader = /* glsl */ `
	precision highp float;
	
	attribute vec2 position;

	uniform mat3 uvTransformMatrix;
	uniform vec2 uResolution;

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
	uniform mat3 uvTransformMatrix;

	varying vec2 vUv;

	void main() {
		vec2 uv = gl_FragCoord.xy / uResolution.xy;
		uv = (uvTransformMatrix * vec3(uv, 1.0)).xy;
		
		// sample the source texture (the source rendertarget)
		vec4 sceneTexture = texture2D(source, uv);

		// sample the input texture (pingpong input) 
		vec4 inputTexture = texture2D(diffuse, uv);
		
		// mix them together
		float mixAmount = min(amount, 0.99);
		vec4 fragColor = mix(sceneTexture, inputTexture, mixAmount);

		// finally paint the fresh scene over the feedback texture
		fragColor = fragColor + sceneTexture;
		
		// blend the source texture over the feedback texture
		gl_FragColor = fragColor;
	}
`
