<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { getWebglContext } from '$lib/visualizers/contexts/webgl'
	import { map } from '$lib/visualizers/utils/Maths'
	import { onDestroy } from 'svelte'
	import {
		type Group,
		BufferGeometry,
		BufferAttribute,
		MeshBasicMaterial,
		Mesh,
		MeshLambertMaterial,
		DirectionalLight,
		PointLight,
		MeshStandardMaterial,
		MeshPhongMaterial,
		AmbientLight,
		MathUtils,
		PointsMaterial,
		IcosahedronGeometry,
		Color,
		MeshPhysicalMaterial,
		type Shader
	} from 'three'

	const noise = `
	//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}
	`

	export let parent: Group

	const { onFrame } = getWebglContext()

	// Components
	const geometry = new BufferGeometry()

	// Vertices
	const count = 512
	const vertices = new Float32Array(count * 3)
	const normals = new Float32Array(count * 3)

	function createSphere() {
		const icosahedron = new IcosahedronGeometry(1, 0)
		vertices.set(icosahedron.attributes.position.array)
		normals.set(icosahedron.attributes.normal.array)
	}

	createSphere()

	console.log(vertices, normals)

	// const indices = [0, 1, 2, 2, 3, 0]
	// geometry.setIndex(indices)
	geometry.setAttribute('position', new BufferAttribute(vertices, 3))
	geometry.setAttribute('normal', new BufferAttribute(normals, 3))

	const material = new MeshPhysicalMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0.5 })
	// Extend the Physical Material component (https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical.glsl.js)
	// Swap in uniforms, and swap lines of the shaders before GPU compilation
	const onBeforeCompile = (shader: Shader) => {
		// Uniforms
		shader.uniforms.mixAmount = { value: 1.0 }

		// Vertex Shader
		// Inject code into the shader by replacing lines
		// Add uniforms to top of shader
		shader.vertexShader =
			`uniform float mixAmount;
				` + shader.vertexShader

		shader.vertexShader = shader.vertexShader.replace(
			`gl_Position = projectionMatrix * mvPosition;`,
			`gl_Position = projectionMatrix * mvPosition + 2.0;`
		)

		// Fragment Shader
		// Add uniforms to top of shader
		shader.fragmentShader =
			`uniform float mixAmount;
				` + shader.fragmentShader

		// Inject code into the shader by replacing lines
		// Gradient map shader goes here
		shader.fragmentShader = shader.fragmentShader.replace(
			`vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;`,
			`vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
				totalDiffuse = mix(totalDiffuse.rgb, vec3(0.0, 1.0, 0.0), mixAmount);
				outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;`
		)

		// Put the shader into the material's userData so it can be accessed by the material object
		material.userData.shader = shader
	}

	// Modifies the shader
	material.onBeforeCompile = onBeforeCompile

	// const material = new PointsMaterial({ depthWrite: false, color: 0xff0000, size: 0.1 })
	const mesh = new Mesh(geometry, material)

	console.log('material', material)

	onFrame(({ elapsedTime }) => {
		if (material.userData.shader) {
			material.userData.shader.uniforms.mixAmount.value = map(Math.sin(elapsedTime), -1, 1, 0, 1)
		}
	})

	$: if (parent) {
		parent.add(mesh)
	}

	onDestroy(() => {
		parent.remove(mesh)
	})
</script>
