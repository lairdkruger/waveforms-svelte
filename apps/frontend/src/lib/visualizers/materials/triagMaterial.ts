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
	uniform vec2 uResolution;


	void main() {
		vec2 uv = gl_FragCoord.xy / uResolution.xy;

		gl_FragColor = texture2D(diffuse, uv);
	}
`
