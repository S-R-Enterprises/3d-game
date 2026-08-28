import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const NoiseShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0.15 },
    speed: { value: 0.5 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    #include <common>
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    uniform float speed;
    varying vec2 vUv;

    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      
      vec4 color = texture2D(tDiffuse, vUv);

      
      vec2 uv = vUv * vec2(1920.0, 1080.0) * 0.5; 
      float noise = random(uv + vec2(time * speed, 0.0));

      
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 noiseColor = mix(color.rgb, vec3(luminance), intensity * noise);

      gl_FragColor = vec4(noiseColor, 1.0);
    }
  `,
}

export class NoisePass extends ShaderPass {
  constructor(parameters) {
    super(NoiseShader)
    this.uniforms.intensity.value = parameters.intensity || 0.15
    this.uniforms.speed.value = parameters.speed || 0.5
  }
}

// Updated on 2026-08-28
 