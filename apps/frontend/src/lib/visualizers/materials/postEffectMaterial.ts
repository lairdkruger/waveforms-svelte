import type { Texture, Vector2 } from 'three'

export interface PostEffectMaterialUniforms {
	source: { value: Texture | null }
	uResolution: { value: Vector2 }
	segments: { value: number }
	rotation: { value: number }
	movement: { value: number }
	radius: { value: number }
	stretch: { value: number }
	loops: { value: number }
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
	uniform float stretch;
	uniform float loops;

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

		// Handle screen aspect ratio and apply to uv
		float aspect = uResolution.x / uResolution.y;
		uv.x *= aspect;

		// Convert uv to polar coords
		float angle = atan(uv.y, uv.x);
		float distance = length(uv);

		// Radius needs to extend to the corner of the screen
		distance *= loops;

		// Apply radius uniform to radius
		distance = distance;

		// Apply angle uniform to angle
		angle = angle + rotation;

		// Remap angle from [-PI, PI] to [0, 1]
		angle = (angle / (2.0 * PI)) + 0.5;

		// Handle segment fragments
		angle = fract(angle * segments);

		// Angle goes from 0 - 1 - 0
		angle = mirror(angle) * 2.0 - 1.0;

		// Apply movement uniform
		angle = angle + movement;

		// Set UV to polar coords
		uv = vec2(angle, distance);

		// Use uniform to toggle between polar and cartesian coords
		if (stretch == 0.0) {
			// If stretch is disabled, perform final conversion back to cartesian coords
			uv = vec2(cos(angle), sin(angle)) * distance + 0.5 + radius;		
		}

		// Handle out of bounds: Reflect outside the inner circle boundary.
		uv = max(min(uv, 2.0 - uv), -uv);	
		
		// Check out the UV pattern here:
		gl_FragColor = vec4(uv.y, uv.y, uv.y, 1.0);
		
		vec4 sceneTexture = texture2D(source, uv);
		vec4 fragColor = sceneTexture;
		gl_FragColor = fragColor;
	}
`
