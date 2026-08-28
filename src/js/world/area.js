import gsap from 'gsap'
import * as THREE from 'three'

import outlineFragmentShader from '../../shaders/outline/fragment.glsl'

import outlineVertexShader from '../../shaders/outline/vertex.glsl'

import Experience from '../experience.js'
import Horse from './horse.js'
import OdysseyTitle from './odysseyTitle.js'
import Skybox from './skybox.js'

export default class Area {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.camera = this.experience.camera.instance
    this.iMouse = this.experience.iMouse
    this.time = this.experience.time 
    this.debug = this.experience.debug

    this.homeStuffs = [
      
      'bedroll',
      'bedroll-packed',
      'tent-canvas',
      
      'chest',
      'bottle',
      
      'workbench-anvil',
      'tool-axe-upgraded',
      'tool-hammer',
      'weapon-rack',
      
      'weapon-sword',
      
      'bench',
      'bench-short',
      'bottle-large',
      'bowl',
      'cooking-knife',
      'cup',
      'egg-cooked',
      'fish',
      'fish-bones',
      'fish-bones.001',
      'Torus',
      
      'pan',
      
      'spawn-round',
    ]
    this.homeStuffsObject = []
    // Project billboards + old HexianWeb 3D title signs removed for Odyssey
    this.billboardNames = ['brand1', 'brand2', 'brand3']
    this.legacyTitleNames = ['homeStart', 'projects']
    this.outlineMeshes = [] 

    this.raycaster = new THREE.Raycaster()

    
    this.createBaseMaterial()

    
    if (this.debug.active) {
      this.debugInit()
    }

    // Store the currently hovered object
    this.hoveredObject = null

    // Horse near hay bales
    this.horse = new Horse()
    // Odyssey 3D world title
    this.odysseyTitle = new OdysseyTitle()

    this.setupArea()
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('click', this.onMouseDown.bind(this))
  }

  
  createBaseMaterial() {
    
    this.outlineParams = {
      thickness: 0.051,
      color: '#d7df9c',
      opacity: 0.8,
      breathingSpeed: 4.0,
      breathingMin: 0.6,
      breathingRange: 0.4,
      timeOffset: Math.PI * 2,
    }

    
    this.baseMaterialConfig = {
      uniforms: {
        uOutlineThickness: { value: this.outlineParams.thickness },
        uOutlineColor: { value: new THREE.Color(this.outlineParams.color) },
        uTime: { value: 0 },
        uOpacity: { value: this.outlineParams.opacity },
        uTimeOffset: { value: this.outlineParams.timeOffset },
        uBreathingSpeed: { value: this.outlineParams.breathingSpeed },
        uBreathingMin: { value: this.outlineParams.breathingMin },
        uBreathingRange: { value: this.outlineParams.breathingRange },
      },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      side: THREE.BackSide,
      transparent: true,
    }
  }

  
  createMaterialInstance(_index) {
    
    const materialConfig = {
      ...this.baseMaterialConfig,
      uniforms: {
        ...this.baseMaterialConfig.uniforms,
        uTimeOffset: { value: (_index / this.homeStuffs.length) * Math.PI * 2 + Math.random() },
      },
    }
    return new THREE.ShaderMaterial(materialConfig)
  }

  setupArea() {
    this.model = this.resources.items.sceneModel
    let meshIndex = 0 

    
    this.model.scene.traverse((child) => {
      if (this.homeStuffs.includes(child.name)) {
        this.homeStuffsObject.push(child)

        
        if (child instanceof THREE.Mesh && child.geometry) {
          
          const outlineMaterial = this.createMaterialInstance(meshIndex++)

          
          const outlineMesh = new THREE.Mesh(child.geometry, outlineMaterial)
          outlineMesh.name = `${child.name}_outline`
          outlineMesh.castShadow = false
          outlineMesh.receiveShadow = false

          
          child.add(outlineMesh)
          
          this.outlineMeshes.push({ mesh: outlineMesh, material: outlineMaterial })
        }
      }
      // Hide project billboards completely
      if (this.billboardNames.includes(child.name)) {
        child.visible = false
      }
      // Hide legacy HexianWeb 3D title signs
      if (this.legacyTitleNames.includes(child.name)) {
        child.visible = false
      }
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    this.scene.add(this.model.scene)

    
    
    this.skybox = new Skybox()
  }

  onMouseMove() {
    this.raycaster.setFromCamera(this.iMouse.normalizedMouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.homeStuffsObject)

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      document.body.style.cursor = 'pointer'

      // If we're hovering a new object
      if (this.hoveredObject !== intersectedObject) {
        // Reset previous object if exists
        if (this.hoveredObject) {
          gsap.to(this.hoveredObject.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.3,
            ease: 'power2.out',
          })
        }

        
        this.hoveredObject = intersectedObject
        gsap.to(this.hoveredObject.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }
    else {
      document.body.style.cursor = 'default'

      // Reset currently hovered object if exists
      if (this.hoveredObject) {
        gsap.to(this.hoveredObject.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
        this.hoveredObject = null
      }
    }
  }

  onMouseDown() {
  }

  update() {
    
    const time = this.time.elapsed * 0.002
    for (const { material } of this.outlineMeshes) {
      material.uniforms.uTime.value = time
    }
    
    if (this.horse) {
      this.horse.update()
    }
  }

  
  debugInit() {
    
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Outline Glow Effect',
      expanded: false,
    })

    
    const basicFolder = this.debugFolder.addFolder({
      title: 'Basic Properties',
      expanded: true,
    })

    
    basicFolder.addBinding(
      this.outlineParams,
      'thickness',
      {
        label: 'Outline Thickness',
        min: 0,
        max: 0.1,
        step: 0.001,
      },
    ).on('change', () => {
      this.outlineMeshes.forEach(({ material }) => {
        material.uniforms.uOutlineThickness.value = this.outlineParams.thickness
      })
    })

    
    basicFolder.addBinding(
      this.outlineParams,
      'color',
      {
        label: 'Outline Color',
        view: 'color',
      },
    ).on('change', () => {
      this.outlineMeshes.forEach(({ material }) => {
        material.uniforms.uOutlineColor.value.set(this.outlineParams.color)
      })
    })

    
    basicFolder.addBinding(
      this.outlineParams,
      'opacity',
      {
        label: 'Base Opacity',
        min: 0,
        max: 1,
        step: 0.01,
      },
    ).on('change', () => {
      this.outlineMeshes.forEach(({ material }) => {
        material.uniforms.uOpacity.value = this.outlineParams.opacity
      })
    })

    
    const breathingFolder = this.debugFolder.addFolder({
      title: 'Breathing Effect',
      expanded: true,
    })

    
    breathingFolder.addBinding(
      this.outlineParams,
      'breathingSpeed',
      {
        label: 'Breathing Speed',
        min: 0.1,
        max: 10,
        step: 0.1,
      },
    ).on('change', () => {
      this.outlineMeshes.forEach(({ material }) => {
        material.uniforms.uBreathingSpeed.value = this.outlineParams.breathingSpeed
      })
    })

    
    breathingFolder.addBinding(
      this.outlineParams,
      'breathingMin',
      {
        label: 'Min Brightness',
        min: 0,
        max: 1,
        step: 0.01,
      },
    ).on('change', () => {
      this.outlineMeshes.forEach(({ material }) => {
        material.uniforms.uBreathingMin.value = this.outlineParams.breathingMin
      })
    })

    
    breathingFolder.addBinding(
      this.outlineParams,
      'breathingRange',
      {
        label: 'Brightness Range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    ).on('change', () => {
      this.outlineMeshes.forEach(({ material }) => {
        material.uniforms.uBreathingRange.value = this.outlineParams.breathingRange
      })
    })
  }
}

// Updated on 2026-08-28
