import type { Matrix3, Texture, Vector2 } from 'three'

export interface PostEffectMaterialUniforms {
	source: { value: Texture | null }
	amount: { value: number }
	uResolution: { value: Vector2 }
	uvTransformMatrix: { value: Matrix3 }
}

export const postEffectVertexShader = /* glsl */ `
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

export const postEffectFragmentShader = /* glsl */ `
	precision highp float;

  	uniform sampler2D source;
	uniform float amount;
	uniform vec2 uResolution;
	uniform mat3 uvTransformMatrix;

	varying vec2 vUv;

	// Function that mirrors the value as it goes from 0 - 1 to 0 - 0.5 - 0
	// This is used to create a kaleidoscope effect
	float mirror(float value) {
		return abs(value - 0.5) + 0.5;
	}

	void main() {
		vec2 uv = gl_FragCoord.xy / uResolution.xy;
		uv = (uvTransformMatrix * vec3(uv, 1.0)).xy;

		uv.y = mirror(uv.y);
		uv.x = mirror(uv.x);
		
		// sample the source texture (the source rendertarget)
		vec4 sceneTexture = texture2D(source, uv);
		
		// finally paint the fresh scene over the feedback texture
		vec4 fragColor = sceneTexture;
		
		// blend the source texture over the feedback texture
		gl_FragColor = fragColor;
	}
`

// Arctan for polar coordinates for kaleidoscope
