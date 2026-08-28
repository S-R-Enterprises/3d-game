import gsap from 'gsap'
import * as THREE from 'three'
import portalFragmentShader from '../../shaders/portal/fragment.glsl'
import portalVertexShader from '../../shaders/portal/vertex.glsl'
import Experience from '../experience.js'
import DayNightManager from '../ui/day-night-manager.js'

export default class PortalEffect {
  constructor() {
    
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.time = this.experience.time

    
    this.params = {
      colorA: '#26353c', 
      colorB: '#c847cb', 
      colorBNight: '#47cb4e', 
      noiseScale: 4.6, 
      timeScale: 0.2, 
      glowIntensity: 5.0, 
      glowOffset: 1.4, 
    }

    
    this.setMaterial()
    this.findPortalMesh()
    this.setupDayNightListener()

    // Debug
    if (this.debug.active) {
      this.debugInit()
    }
  }

  setupDayNightListener() {
    
    this.dayNightManager = new DayNightManager()
    this.dayNightManager.on('dayNightToggle', (isNight) => {
      this.handleDayNightTransition(isNight)
    })
  }

  handleDayNightTransition(isNight) {
    
    const targetColor = isNight ? this.params.colorBNight : this.params.colorB
    const currentColor = new THREE.Color()
    currentColor.copy(this.portalMaterial.uniforms.uColorB.value)

    gsap.to(currentColor, {
      r: new THREE.Color(targetColor).r,
      g: new THREE.Color(targetColor).g,
      b: new THREE.Color(targetColor).b,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.portalMaterial.uniforms.uColorB.value.copy(currentColor)
      },
    })
  }

  setMaterial() {
    
    this.portalMaterial = new THREE.ShaderMaterial({
      vertexShader: portalVertexShader,
      fragmentShader: portalFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(this.params.colorA) },
        uColorB: { value: new THREE.Color(this.params.colorB) },
        uNoiseScale: { value: this.params.noiseScale },
        uTimeScale: { value: this.params.timeScale },
        uGlowIntensity: { value: this.params.glowIntensity },
        uGlowOffset: { value: this.params.glowOffset },
      },
      side: THREE.DoubleSide,
      transparent: true,
    })
  }

  findPortalMesh() {
    
    this.scene.traverse((child) => {
      if (child.name === 'portalcircle') {
        console.warn('Portal mesh found:', child)
        
        this.originalMaterial = child.material
        
        child.material = this.portalMaterial
        
        this.portalMesh = child
      }
    })
  }

  debugInit() {
    
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Portal Effect',
      expanded: false,
    })

    
    if (this.portalMesh) {
      this.debugFolder.addBinding(
        this.portalMesh,
        'visible',
        {
          label: 'Show Portal',
        },
      )
    }

    
    this.debugFolder.addBinding(
      this.params,
      'colorA',
      {
        label: 'Color A',
        view: 'color',
      },
    ).on('change', () => {
      this.portalMaterial.uniforms.uColorA.value.set(this.params.colorA)
    })

    this.debugFolder.addBinding(
      this.params,
      'colorB',
      {
        label: 'Color B (Day)',
        view: 'color',
      },
    ).on('change', () => {
      this.portalMaterial.uniforms.uColorB.value.set(this.params.colorB)
    })

    this.debugFolder.addBinding(
      this.params,
      'colorBNight',
      {
        label: 'Color B (Night)',
        view: 'color',
      },
    )

    
    this.debugFolder.addBinding(
      this.params,
      'noiseScale',
      {
        label: 'Noise Scale',
        min: 0.1,
        max: 10.0,
        step: 0.1,
      },
    ).on('change', () => {
      this.portalMaterial.uniforms.uNoiseScale.value = this.params.noiseScale
    })

    this.debugFolder.addBinding(
      this.params,
      'timeScale',
      {
        label: 'Time Scale',
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
    ).on('change', () => {
      this.portalMaterial.uniforms.uTimeScale.value = this.params.timeScale
    })

    
    this.debugFolder.addBinding(
      this.params,
      'glowIntensity',
      {
        label: 'Glow Intensity',
        min: 0.0,
        max: 10.0,
        step: 0.1,
      },
    ).on('change', () => {
      this.portalMaterial.uniforms.uGlowIntensity.value = this.params.glowIntensity
    })

    this.debugFolder.addBinding(
      this.params,
      'glowOffset',
      {
        label: 'Glow Offset',
        min: 0.0,
        max: 3.0,
        step: 0.1,
      },
    ).on('change', () => {
      this.portalMaterial.uniforms.uGlowOffset.value = this.params.glowOffset
    })
  }

  update() {
    
    if (this.portalMaterial) {
      this.portalMaterial.uniforms.uTime.value = this.time.elapsed * 0.001
    }
  }
}

// Updated on 2026-08-28
 