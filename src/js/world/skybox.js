import * as THREE from 'three'
import Experience from '../experience.js'
import DayNightManager from '../ui/day-night-manager.js'


export default class Skybox {
  constructor() {
    
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    
    this.isNight = false

    
    this.createSkybox()

    
    this.dayNightManager = new DayNightManager()
    this.dayNightManager.on('dayNightToggle', (isNight) => {
      this.switchTexture(isNight)
    })

    
    if (this.debug.active) {
      this.debugInit()
    }
  }

  
  createSkybox() {
    
    this.geometry = new THREE.SphereGeometry(128)
    
    this.resources.items.dayTexture.colorSpace = THREE.SRGBColorSpace
    this.material = new THREE.MeshBasicMaterial({
      map: this.resources.items.dayTexture,
      side: THREE.BackSide,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  
  switchTexture(isNight) {
    this.isNight = isNight
    const texture = isNight ? this.resources.items.nightTexture : this.resources.items.dayTexture
    texture.colorSpace = THREE.SRGBColorSpace
    this.material.map = texture
    this.material.needsUpdate = true
  }

  
  debugInit() {
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Skybox',
      expanded: false,
    })
    this.debugFolder.addBinding(this, 'isNight', {
      label: 'Night Mode',
      readonly: true,
    })
  }
}

// Updated on 2026-08-28
