import type { Texture, Vector2 } from 'three'

export interface PostEffectMaterialUniforms {
	source: { value: Texture | null }
	uResolution: { value: Vector2 }
	segments: { value: number }
	rotation: { value: number }
	movement: { value: number }
	radius: { value: number }
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
	uniform float segments;
	uniform float rotation;
	uniform float movement;
	uniform float radius;

	varying vec2 vUv;

	const float PI = 3.1415926535897932384626433832795;

	// Function that mirrors the value as it goes from 0 - 1 to 0 - 0.5 - 0
	// This is used to create a kaleidoscope effect
	float mirror(float value) {
		return abs(value - 0.5) + 0.5;
	}

	void main() {
		vec2 uv = gl_FragCoord.xy / uResolution.xy;

		// Kaleidoscope effect
		// If segments is 0, just show the source texture
		if (segments == 0.0) {
			gl_FragColor = texture2D(source, uv);
			return;
		}

		// Center the system so 0 is in the middle 
		// [0, 1] to [-0.5, 0.5]
		uv -= vec2(0.5);

		float angle = atan(uv.y, uv.x);

		float distance = length(uv);
		// Radius needs to extend to the corner of the screen
		float aspect = uResolution.x / uResolution.y;
		distance /= aspect;

		// Apply radius uniform to radius
		distance = distance + radius;

		// Apply angle uniform to angle
		angle = angle + rotation;

		// Remap angle from [-PI, PI] to [0, 1]
		angle = (angle / (2.0 * PI)) + 0.5;
		// angle += 0.0;

		angle = fract(angle * segments);

		// Angle goes from 0 - 1 - 0
		angle = mirror(angle) * 2.0 - 1.0;

		// Apply movement uniform
		angle = angle + movement;

		// Clamp value from 0 to 2 * PI after adding rotation vector

		// Option:
		// We want it to straddle 0.5 - where the size of the range depends on the value of segments
		// Eg: 4 segments = 1 / 4 = 0.25 so angle should be 0.5 +/- 0.25 = [0.25 - 0.75]
		// float range = 1.0 / (segments / 2.0);
		// float offset = range / 2.0;
		
		// // From 0 - 1 to 0 - 0.25 to -0.125 - 0.125
		// angle = (angle * range) - offset;
		// angle = 0.5 + angle;

		uv = vec2(angle, distance);

		// Check out the UV pattern here:
		gl_FragColor = vec4(angle, angle, angle, 1.0);
		
		vec4 sceneTexture = texture2D(source, uv);
		vec4 fragColor = sceneTexture;
		gl_FragColor = fragColor;
	}
`
