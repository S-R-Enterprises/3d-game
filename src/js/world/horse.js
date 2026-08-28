import * as THREE from 'three'
import Experience from '../experience.js'

/**
 * Horse that slowly patrols the old chicken area.
 */
export default class Horse {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug

    // Same area the chicken used
    this.params = {
      scale: 1, // Fixed scale for new model
      position: { x: 19, y: -0.35, z: 1.0 }, // Moved left from 22
      rotationY: 0, // Face forward (towards the path)
      patrolLength: 2.5,
      moveSpeed: 0, // Stop walking
      animSpeed: 1.0, // Normal idle speed
    }

    this.horseObject = null
    this.mixer = null
    this.action = null
    this.patrolDirection = -1
    this.patrolOriginX = this.params.position.x

    this.initHorse()

    if (this.debug.active) {
      this.debugInit()
    }
  }

  initHorse() {
    this.buildStable()

    const horseResource = this.resources.items.horseModel
    if (!horseResource || !horseResource.scene) {
      console.warn('Horse model not loaded')
      return
    }

    this.horseObject = horseResource.scene
    this.horseObject.name = 'horseModel'
    this.horseObject.scale.setScalar(this.params.scale)
    this.horseObject.position.set(
      this.params.position.x,
      this.params.position.y,
      this.params.position.z,
    )
    this.horseObject.rotation.y = this.params.rotationY

    this.horseObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          // Keep original textures from the new model!
          // const mat = child.material.clone()
          // mat.color = new THREE.Color('#8b6914')
          // mat.roughness = 0.85
          // mat.metalness = 0.05
          // child.material = mat
        }
      }
    })

    this.scene.add(this.horseObject)

    if (horseResource.animations && horseResource.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(this.horseObject)
      const idleAnim = horseResource.animations.find(a => a.name.toLowerCase().includes('idle'))
      this.action = this.mixer.clipAction(idleAnim || horseResource.animations[0])
      this.action.timeScale = this.params.animSpeed
      this.action.play()
    }
  }

  buildStable() {
    const stableGroup = new THREE.Group()
    
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: '#8B5A2B', // Lighter brown wood
      roughness: 1.0,
      metalness: 0.0,
    })
    
    const w = 3.5    // Width (reduced)
    const d = 2.5    // Depth (reduced)
    const h = 2.0    // Height (reduced)
    const t = 0.1    // Wall/post thickness

    // 4 Corner Posts
    const postGeo = new THREE.BoxGeometry(t, h, t)
    const positions = [
      [-w/2, h/2, -d/2],
      [w/2, h/2, -d/2],
      [-w/2, h/2, d/2],
      [w/2, h/2, d/2]
    ]
    positions.forEach((pos) => {
      const post = new THREE.Mesh(postGeo, woodMaterial)
      post.position.set(pos[0], pos[1], pos[2])
      post.castShadow = true
      post.receiveShadow = true
      stableGroup.add(post)
    })

    // Back wall
    const wallGeo = new THREE.BoxGeometry(w + t, h, t)
    const backWall = new THREE.Mesh(wallGeo, woodMaterial)
    backWall.position.set(0, h/2, -d/2)
    backWall.castShadow = true
    backWall.receiveShadow = true
    stableGroup.add(backWall)

    // Side walls
    const sideWallGeo = new THREE.BoxGeometry(t, h, d - t)
    const leftWall = new THREE.Mesh(sideWallGeo, woodMaterial)
    leftWall.position.set(-w/2, h/2, 0)
    leftWall.castShadow = true
    leftWall.receiveShadow = true
    stableGroup.add(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo, woodMaterial)
    rightWall.position.set(w/2, h/2, 0)
    rightWall.castShadow = true
    rightWall.receiveShadow = true
    stableGroup.add(rightWall)

    // Roof
    const roofGeo = new THREE.BoxGeometry(w + 0.4, t, d + 0.4)
    const roof = new THREE.Mesh(roofGeo, woodMaterial)
    roof.position.set(0, h, 0)
    roof.rotation.x = -Math.PI * 0.05
    roof.castShadow = true
    roof.receiveShadow = true
    stableGroup.add(roof)

    stableGroup.position.set(this.params.position.x, this.params.position.y, this.params.position.z)
    
    this.scene.add(stableGroup)
  }

  update() {
    if (!this.horseObject)
      return

    if (this.mixer) {
      this.mixer.update(this.time.delta * 0.001)
    }

    // Slow back-and-forth patrol along X
    if (this.params.moveSpeed > 0) {
      const dt = this.time.delta * 0.001
      const nextX = this.horseObject.position.x
        + this.patrolDirection * this.params.moveSpeed * dt

      const minX = this.patrolOriginX - this.params.patrolLength * 0.5
      const maxX = this.patrolOriginX + this.params.patrolLength * 0.5

      if (nextX <= minX) {
        this.patrolDirection = 1
        this.horseObject.rotation.y = Math.PI / 2
        this.horseObject.position.x = minX
      }
      else if (nextX >= maxX) {
        this.patrolDirection = -1
        this.horseObject.rotation.y = -Math.PI / 2
        this.horseObject.position.x = maxX
      }
      else {
        this.horseObject.position.x = nextX
      }
    }

    this.horseObject.position.y = this.params.position.y
    this.horseObject.position.z = this.params.position.z
  }

  debugInit() {
    const folder = this.debug.ui.addFolder({
      title: 'Horse',
      expanded: false,
    })

    folder.addBinding(this.params, 'scale', {
      label: 'Scale',
      min: 0.1,
      max: 5.0,
      step: 0.01,
    }).on('change', () => {
      if (this.horseObject)
        this.horseObject.scale.setScalar(this.params.scale)
    })

    folder.addBinding(this.params, 'moveSpeed', {
      label: 'Move Speed',
      min: 0.1,
      max: 3,
      step: 0.05,
    })

    folder.addBinding(this.params, 'animSpeed', {
      label: 'Anim Speed',
      min: 0.05,
      max: 1.5,
      step: 0.05,
    }).on('change', () => {
      if (this.action)
        this.action.timeScale = this.params.animSpeed
    })

    folder.addBinding(this.params, 'patrolLength', {
      label: 'Patrol Length',
      min: 1,
      max: 12,
      step: 0.5,
    })

    const posFolder = folder.addFolder({ title: 'Position', expanded: true })
    ;['x', 'y', 'z'].forEach((axis) => {
      posFolder.addBinding(this.params.position, axis, {
        label: axis.toUpperCase(),
        min: -40,
        max: 40,
        step: 0.1,
      }).on('change', () => {
        this.patrolOriginX = this.params.position.x
        if (this.horseObject) {
          this.horseObject.position.set(
            this.params.position.x,
            this.params.position.y,
            this.params.position.z,
          )
        }
      })
    })
  }
}

// Updated on 2026-08-28
