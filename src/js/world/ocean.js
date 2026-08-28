import GSAP from 'gsap'
import * as THREE from 'three'
import Experience from '../experience.js'
import DayNightManager from '../ui/day-night-manager.js'

export default class Ocean {
  constructor() {
    
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug

    
    this.debugObject = {
      surfaceColor: '#179f8e',
      foamColor: '#36cee5',
      colorOffset: 0.25,
      colorMultiplier: 1.87,
      flowSpeed: 0.1,
      waveSpeed: 0.12,
      noiseScale: 1.5, 
      waveHeight: 2.35, 
      nightDarkFactor: 0.3, 
    }

    
    this.setGeometry()
    this.setMaterial()
    this.setMesh()

    
    this.dayNightManager = new DayNightManager()
    this.dayNightManager.on('dayNightToggle', (isNight) => {
      
      GSAP.to(this.material.uniforms.uNightTransition, {
        value: isNight ? 1 : 0,
        duration: 2,
        ease: 'power2.inOut',
      })
    })

    if (this.debug.active) {
      this.debugInit()
    }
  }

  setGeometry() {
    
    this.geometry = new THREE.PlaneGeometry(128, 128, 64, 64)
  }

  setMaterial() {
    this.resources.items.waterMaskTexture.wrapS = THREE.RepeatWrapping
    this.resources.items.waterMaskTexture.wrapT = THREE.RepeatWrapping

    
    this.material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        varying vec2 vUv;
        varying float vElevation;
        
        uniform float uTime;
        uniform float uFlowSpeed;
        uniform float uWaveSpeed;
        uniform float uNoiseScale;
        uniform float uWaveHeight;

        
        vec2 random2(vec2 point) {
          float d1 = dot(point, vec2(12.3, 32.1));
          float d2 = dot(point, vec2(45.6, 65.4));
          point = vec2(d1, d2);
          return fract(sin(point) * 78.9) * 2.0 - 1.0;
        }

        
        float noise(vec2 point) {
          vec2 i = floor(point);
          vec2 f = fract(point);

          vec2 u = smoothstep(0.0, 1.0, f);
          
          float d1 = dot(random2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
          float d2 = dot(random2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
          float d3 = dot(random2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
          float d4 = dot(random2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
          
          return mix(mix(d1, d2, u.x), mix(d3, d4, u.x), u.y);
        }

        
        float fbm(vec2 point) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          
          for(int i = 0; i < 4; i++) {
            value += amplitude * noise(point * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          vUv = uv;
          
          vUv.x += uTime * uFlowSpeed * 0.015;
          
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          
          float elevation = fbm(vec2(
            modelPosition.x * uNoiseScale + uTime * uWaveSpeed,
            modelPosition.z * uNoiseScale + uTime * uWaveSpeed
          )) * uWaveHeight;
          
          modelPosition.y += abs(elevation);
          vElevation = elevation;
          
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
        }
      `,
      fragmentShader: /* glsl  */`
        uniform sampler2D uWaterMask;
        uniform vec3 uSurfaceColor;
        uniform vec3 uFoamColor;
        uniform vec3 uNightSurfaceColor;
        uniform vec3 uNightFoamColor;
        uniform float uColorOffset;
        uniform float uColorMultiplier;
        uniform float uNightTransition;
        
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          
          vec4 waterMask = texture2D(uWaterMask, vUv * vec2(64.0, 64.0));
          
          
          vec3 dayColor = mix(uSurfaceColor, uFoamColor, waterMask.r);
          vec3 nightColor = mix(uNightSurfaceColor, uNightFoamColor, waterMask.r);
          
          
          vec3 finalColor = mix(dayColor, nightColor, uNightTransition);
          
          
          float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
          finalColor = mix(finalColor, uFoamColor, mixStrength * waterMask.r);
          
          gl_FragColor = vec4(finalColor, 0.7);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uWaterMask: { value: this.resources.items.waterMaskTexture },
        uSurfaceColor: { value: new THREE.Color(this.debugObject.surfaceColor) },
        uFoamColor: { value: new THREE.Color(this.debugObject.foamColor) },
        uNightSurfaceColor: { value: new THREE.Color(this.debugObject.surfaceColor).multiplyScalar(this.debugObject.nightDarkFactor) },
        uNightFoamColor: { value: new THREE.Color(this.debugObject.foamColor).multiplyScalar(this.debugObject.nightDarkFactor) },
        uColorOffset: { value: this.debugObject.colorOffset },
        uColorMultiplier: { value: this.debugObject.colorMultiplier },
        uFlowSpeed: { value: this.debugObject.flowSpeed },
        uWaveSpeed: { value: this.debugObject.waveSpeed },
        uNoiseScale: { value: this.debugObject.noiseScale },
        uWaveHeight: { value: this.debugObject.waveHeight },
        uNightTransition: { value: 0 },
      },
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    })
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotation.x = -Math.PI * 0.5
    this.mesh.position.y = -1.2
    this.scene.add(this.mesh)
  }

  updateNightColors() {
    
    this.material.uniforms.uNightSurfaceColor.value.copy(
      new THREE.Color(this.debugObject.surfaceColor).multiplyScalar(this.debugObject.nightDarkFactor),
    )
    this.material.uniforms.uNightFoamColor.value.copy(
      new THREE.Color(this.debugObject.foamColor).multiplyScalar(this.debugObject.nightDarkFactor),
    )
  }

  debugInit() {
    
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Ocean',
      expanded: false,
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'surfaceColor',
      {
        label: 'Ocean Color',
        view: 'color',
      },
    ).on('change', () => {
      this.material.uniforms.uSurfaceColor.value.set(this.debugObject.surfaceColor)
      this.updateNightColors()
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'foamColor',
      {
        label: 'Foam Color',
        view: 'color',
      },
    ).on('change', () => {
      this.material.uniforms.uFoamColor.value.set(this.debugObject.foamColor)
      this.updateNightColors()
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'nightDarkFactor',
      {
        label: 'Night Darken Factor',
        min: 0,
        max: 1,
        step: 0.01,
      },
    ).on('change', () => {
      this.updateNightColors()
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'colorOffset',
      {
        label: 'Color Offset',
        min: 0,
        max: 1,
      },
    ).on('change', () => {
      this.material.uniforms.uColorOffset.value = this.debugObject.colorOffset
    })

    this.debugFolder.addBinding(
      this.debugObject,
      'colorMultiplier',
      {
        label: 'Color Multiplier',
        min: 0,
        max: 10,
      },
    ).on('change', () => {
      this.material.uniforms.uColorMultiplier.value = this.debugObject.colorMultiplier
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'flowSpeed',
      {
        label: 'Flow Speed',
        min: -5,
        max: 5,
        step: 0.1,
      },
    ).on('change', () => {
      this.material.uniforms.uFlowSpeed.value = this.debugObject.flowSpeed
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'waveSpeed',
      {
        label: 'Wave Speed',
        min: 0,
        max: 0.3,
        step: 0.001,
      },
    ).on('change', () => {
      this.material.uniforms.uWaveSpeed.value = this.debugObject.waveSpeed
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'noiseScale',
      {
        label: 'Noise Scale',
        min: 0.1,
        max: 10,
        step: 0.1,
      },
    ).on('change', () => {
      this.material.uniforms.uNoiseScale.value = this.debugObject.noiseScale
    })

    
    this.debugFolder.addBinding(
      this.debugObject,
      'waveHeight',
      {
        label: 'Wave Height',
        min: 0,
        max: 4,
        step: 0.1,
      },
    ).on('change', () => {
      this.material.uniforms.uWaveHeight.value = this.debugObject.waveHeight
    })
  }

  update() {
    
    this.material.uniforms.uTime.value = this.time.elapsed * 0.001
  }
}

// Updated on 2026-08-28
 
