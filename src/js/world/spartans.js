import * as THREE from 'three'
import Experience from '../experience.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

export default class Spartans {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.spartansParams = {
      scale: 1.0,
      positionOffset: { x: 3.5, y: 0.2, z: 3.5 }, // Moved to the front right step area
      rotationY: 0,
    }

    this.spartans2Params = {
      scale: 1.0,
      positionOffset: { x: 3.5, y: 0.2, z: -3.5 }, // Moved further right, behind the wood fence
      rotationY: 0,
    }

    this.spartansObject = null
    this.spartans2Object = null

    this.initSpartans()
    
    if (this.debug.active) {
      this.debugInit()
    }
  }

  initSpartans() {
    // Let's find the portal position
    let portalMesh = null
    this.scene.traverse((child) => {
      if (child.name === 'portalcircle') {
        portalMesh = child
      }
    })
    
    const portalPosition = new THREE.Vector3()
    if (portalMesh) {
      portalMesh.getWorldPosition(portalPosition)
    }

    // Load first spartans model
    const spartansResource = this.resources.items.spartansModel
    if (spartansResource && spartansResource.scene) {
      this.spartansObject = spartansResource.scene
      this.spartansObject.name = 'spartansModel'
      this.spartansObject.scale.setScalar(this.spartansParams.scale)
      
      this.spartansObject.position.set(
        portalPosition.x + this.spartansParams.positionOffset.x,
        portalPosition.y + this.spartansParams.positionOffset.y,
        portalPosition.z + this.spartansParams.positionOffset.z,
      )
      this.scene.add(this.spartansObject)
    }

    // Clone second spartans model
    if (spartansResource && spartansResource.scene) {
      this.spartans2Object = SkeletonUtils.clone(spartansResource.scene)
      this.spartans2Object.name = 'spartans2Model'
      this.spartans2Object.scale.setScalar(this.spartans2Params.scale)
      
      this.spartans2Object.position.set(
        portalPosition.x + this.spartans2Params.positionOffset.x,
        portalPosition.y + this.spartans2Params.positionOffset.y,
        portalPosition.z + this.spartans2Params.positionOffset.z,
      )
      this.scene.add(this.spartans2Object)
    }
  }

  update() {
    // For animations if any
  }

  debugInit() {
    if (!this.debug.ui) return;
    
    // Debug for first spartan
    const spartansFolder = this.debug.ui.addFolder({
      title: 'Spartans Model 1',
      expanded: false,
    })
    
    spartansFolder.addBinding(this.spartansParams, 'scale', {
      label: 'Scale',
      min: 0.01,
      max: 10,
      step: 0.01,
    }).on('change', () => {
        if (this.spartansObject) {
            this.spartansObject.scale.setScalar(this.spartansParams.scale)
        }
    })
    
    const posFolder = spartansFolder.addFolder({ title: 'Position', expanded: true })
    if (this.spartansObject) {
      posFolder.addBinding(this.spartansObject.position, 'x', { label: 'X' })
      posFolder.addBinding(this.spartansObject.position, 'y', { label: 'Y' })
      posFolder.addBinding(this.spartansObject.position, 'z', { label: 'Z' })
      posFolder.addBinding(this.spartansObject.rotation, 'y', { label: 'Rot Y', min: -Math.PI, max: Math.PI })
    }

    // Debug for second spartan
    const spartans2Folder = this.debug.ui.addFolder({
      title: 'Spartans Model 2',
      expanded: false,
    })
    
    spartans2Folder.addBinding(this.spartans2Params, 'scale', {
      label: 'Scale',
      min: 0.01,
      max: 10,
      step: 0.01,
    }).on('change', () => {
        if (this.spartans2Object) {
            this.spartans2Object.scale.setScalar(this.spartans2Params.scale)
        }
    })
    
    const posFolder2 = spartans2Folder.addFolder({ title: 'Position', expanded: true })
    if (this.spartans2Object) {
      posFolder2.addBinding(this.spartans2Object.position, 'x', { label: 'X' })
      posFolder2.addBinding(this.spartans2Object.position, 'y', { label: 'Y' })
      posFolder2.addBinding(this.spartans2Object.position, 'z', { label: 'Z' })
      posFolder2.addBinding(this.spartans2Object.rotation, 'y', { label: 'Rot Y', min: -Math.PI, max: Math.PI })
    }
  }
}
