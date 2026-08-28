import gsap from 'gsap'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import Experience from '../experience.js'
import { NoisePass } from './noise-pass.js' 

export default class Effects {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.renderer = this.experience.renderer
    this.debug = this.experience.debug

    this.setComposer()
    this.setDebug()
    this.animatePixelSize()
  }

  setComposer() {
    this.renderPass = new RenderPass(this.scene, this.camera.instance)

    
    this.noisePass = new NoisePass({
      intensity: 0.65,
      speed: 0.9,
    })

    
    this.pixelPass = new RenderPixelatedPass(1, this.scene, this.camera.instance)
    this.pixelPass.normalEdgeStrength = 0.53
    this.pixelPass.depthEdgeStrength = 0.4

    
    this.outputPass = new OutputPass()
    this.outputPass.exposure = 1.2 
    this.outputPass.toneMapping = THREE.ReinhardToneMapping 
    this.outputPass.toneMappingExposure = 1.2 

    this.composer = new EffectComposer(this.renderer.instance)
    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.noisePass) 
    this.composer.addPass(this.pixelPass)
    
    this.composer.addPass(this.outputPass) 
  }

  setDebug() {
    if (this.debug.active) {
      
      const noiseFolder = this.debug.ui.addFolder({
        title: 'Noise Effect',
      })
      noiseFolder.addBinding(this.noisePass.uniforms.intensity, 'value', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Noise Intensity',
      })
      noiseFolder.addBinding(this.noisePass.uniforms.speed, 'value', {
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Noise Speed',
      })

      
      const pixelFolder = this.debug.ui.addFolder({
        title: 'Pixelation Effect',
      })
      pixelFolder.addBinding(this.pixelPass, 'pixelSize', {
        min: 1,
        max: 16,
        step: 1,
        label: 'Pixel Size',
      }).on('change', ({ value }) => {
        this.pixelPass.setPixelSize(value)
      })
      pixelFolder.addBinding(this.pixelPass, 'normalEdgeStrength', {
        min: 0,
        max: 2,
        step: 0.05,
        label: 'Normal Edge Strength',
      })
      pixelFolder.addBinding(this.pixelPass, 'depthEdgeStrength', {
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Depth Edge Strength',
      })

      
      const outputFolder = this.debug.ui.addFolder({
        title: 'Output Effect',
      })
      outputFolder.addBinding(this.outputPass, 'exposure', {
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Exposure',
      })
      outputFolder.addBinding(this.outputPass, 'toneMappingExposure', {
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Tone Mapping Exposure',
      })
    }
  }

  resize() {
    this.composer.setSize(
      this.experience.sizes.width,
      this.experience.sizes.height,
    )
  }

  
  animatePixelSize() {
    gsap.fromTo(
      this.pixelPass,
      { pixelSize: 10 }, 
      {
        pixelSize: 1, 
        duration: 5, 
        ease: 'power2.out', 
        onUpdate: () => {
          this.pixelPass.pixelSize = Math.round(this.pixelPass.pixelSize / 1) * 1
          this.pixelPass.setPixelSize(this.pixelPass.pixelSize) 
        },
      },
    )
  }

  update() {
    this.composer.render()
    this.noisePass.uniforms.time.value += this.experience.time.delta * 0.1 
  }
}

// Updated on 2026-08-28
 