export const wireFragmentShader = /* glsl */ `
	precision highp float;

	varying float noiseMF;
	varying float noiseHF;

	void main() {
		float disp = 1.0 * 2.0 * noiseHF - (noiseMF * 0.1);
		vec3 color = vec3(1.0-disp, 1.0-disp, 1.0-disp);
		gl_FragColor = vec4( color.rgb, 1.0 );
	}
`
