import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

import Experience from './experience.js'

export default class Camera {
  constructor(orthographic = false) {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.orthographic = orthographic
    this.debug = this.experience.debug
    this.debugActive = this.experience.debug.active

    this.position = new THREE.Vector3(7, 10, 10)
    this.target = new THREE.Vector3(0, 0, 0)

    this.setInstance()
    this.setControls()
    this.setDebug()
  }

  setInstance() {
    if (this.orthographic) {
      const aspect = this.sizes.aspect
      this.frustumSize = 8

      this.instance = new THREE.OrthographicCamera(
        -this.frustumSize * aspect,
        this.frustumSize * aspect,
        this.frustumSize,
        -this.frustumSize,
        -50,
        200,
      )
    }
    else {
      this.instance = new THREE.PerspectiveCamera(
        34,
        this.sizes.width / this.sizes.height,
        0.1,
        100,
      )
    }
    this.instance.position.copy(this.position)
    this.instance.lookAt(this.target)
    this.scene.add(this.instance)
  }

  setControls() {
    
    this.orbitControls = new OrbitControls(this.instance, this.canvas)
    this.orbitControls.noRotate = true 
    this.orbitControls.noPan = true 
    this.orbitControls.enableZoom = false 
    this.orbitControls.minPolarAngle = 0
    this.orbitControls.maxPolarAngle = Math.PI / 2.2
    this.orbitControls.target.copy(this.target)

    
    this.trackballControls = new TrackballControls(this.instance, this.canvas)
    this.trackballControls.noRotate = true 
    this.trackballControls.noPan = true 
    this.trackballControls.noZoom = false 
    this.trackballControls.zoomSpeed = 1 
    this.trackballControls.minZoom = 0.8
    this.trackballControls.maxZoom = 2

    
    this.trackballControls.target.copy(this.target)
  }

  setDebug() {
    if (this.debugActive) {
      const cameraFolder = this.debug.ui.addFolder({
        title: 'Camera',
        expanded: false,
      })

      cameraFolder
        .addBinding(this, 'position', {
          label: 'camera Position',
        })
        .on('change', this.updateCamera.bind(this))

      cameraFolder
        .addBinding(this, 'target', {
          label: 'camera Target',
        })
        .on('change', this.updateCamera.bind(this))
    }
  }

  updateCamera() {
    this.instance.position.copy(this.position)
    this.instance.lookAt(this.target)
    this.orbitControls.target.copy(this.target)
    this.trackballControls.target.copy(this.target)
    this.orbitControls.update()
    this.trackballControls.update()
  }

  resize() {
    if (this.orthographic) {
      const aspect = this.sizes.width / this.sizes.height
      this.instance.left = (-this.frustumSize * aspect)
      this.instance.right = (this.frustumSize * aspect)
      this.instance.top = this.frustumSize
      this.instance.bottom = -this.frustumSize

      this.instance.updateProjectionMatrix()
    }
    else {
      this.instance.aspect = this.sizes.width / this.sizes.height
      this.instance.updateProjectionMatrix()
    }
    this.trackballControls.handleResize()
  }

  update() {
    this.orbitControls.update()
    this.trackballControls.update()
  }
}

// Updated on 2026-08-28
