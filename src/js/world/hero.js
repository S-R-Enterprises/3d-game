import gsap from 'gsap'
import * as THREE from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'
import { Octree } from 'three/addons/math/Octree.js'

import Experience from '../experience.js'

export default class Hero {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.camera = this.experience.camera.instance
    this.iMouse = this.experience.iMouse
    this.time = this.experience.time
    this.debug = this.experience.debug

    // Camera controls interaction flag
    this.controls = this.experience.camera.orbitControls 
    this.isUserInteracting = false 

    // Camera follow parameters
    this.cameraOffset = new THREE.Vector3(0, 2, 5) // Camera offset from character
    this.cameraLerpFactor = 0.1 // Smoothing factor for camera movement
    this.cameraTarget = new THREE.Vector3() // Target position for camera
    this.cameraLookAt = new THREE.Vector3() // Point for camera to look at

    // Character object
    this.character = {
      instance: null,
      moveDistance: 1.2,
      jumpHeight: 1,
      isMoving: false,
      moveDuration: 0.3,
      currentDirection: new THREE.Vector3(-1, 0, 0), // Initially facing -X direction
      isSitting: false,
    }

    // Collision
    this.worldOctree = new Octree()
    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 2.35, 0),
      new THREE.Vector3(0, 3, 0),
      0.35,
    )
    this.playerVelocity = new THREE.Vector3()
    this.playerOnFloor = false
    this.GRAVITY = 30

    // Animation mixer
    this.mixer = null
    this.animations = {}
    this.currentAnimation = null

    // Input tracking
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      arrowUp: false,
      arrowDown: false,
      arrowLeft: false,
      arrowRight: false,
      space: false,
    }

    
    this.heroParams = {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
      visible: true,
    }

    this.hero = this.resources.items.heroModel.scene.children[0]
    console.warn('Model info:', this.resources.items.heroModel)

    this.collider = this.resources.items.colliderModel.scene

    this.animation = {}
    this.animation.mixer = new THREE.AnimationMixer(this.hero)
    this.animation.actions = {}

    const skeleton = new THREE.SkeletonHelper(this.hero)
    skeleton.visible = false
    this.scene.add(skeleton)

    // Get all animations
    this.animation.clips = this.resources.items.heroModel.animations

    if (this.animation.clips.length === 0) {
      console.warn('No animation clips found, check if model contains animation data')
    }
    else {
      console.warn(`Found ${this.animation.clips.length} animation clips`)
    }

    
    this.animationParams = {
      fadeInDuration: 0.5,
      fadeOutDuration: 0.5,
      timeScale: 1.0,
      paused: false,
    }

    // Add animations to actions
    if (this.animation.clips.length) {
      this.animation.clips.forEach((clip) => {
        this.animation.actions[clip.name] = this.animation.mixer.clipAction(clip)
        console.warn(`Add animation: ${clip.name}, duration: ${clip.duration}s`)
      })

      // Set current action
      this.animation.current = this.animation.clips[0].name
      this.animation.actions[this.animation.current].play()

      // Log available animations
      console.warn('Available animations:', this.animation.clips.map(clip => clip.name))
    }

    this.setHero()
    this.setupAnimations()
    this.setupEventListeners()
    this.setupCollider()

    // Listen for user interaction with OrbitControls
    this.setupControlsListeners()

    // Setup debug if active
    if (this.debug.active) {
      this.debugInit()
    }
  }

  setHero() {
    this.hero.position.set(37, 10, 6)
    this.hero.scale.set(2, 2, 2)
    this.hero.rotation.set(0, Math.PI / 2, 0) // Set initial rotation to face -X direction
    this.hero.castShadow = true
    this.hero.receiveShadow = true
    this.scene.add(this.hero)

    this.hero.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    this.character.instance = this.hero

    // Initialize player collider position
    this.playerCollider.start.set(
      this.hero.position.x,
      this.hero.position.y + 2.35,
      this.hero.position.z,
    )
    this.playerCollider.end.set(
      this.hero.position.x,
      this.hero.position.y + 3,
      this.hero.position.z,
    )
  }

  setupCollider() {
    // Initialize octree from the collision model
    if (this.collider) {
      this.worldOctree.fromGraphNode(this.collider)
      console.warn('Octree created from collider model')

      // Make collider model invisible but keep it in the scene for collisions
      this.collider.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = false
        }
      })

      this.scene.add(this.collider)

      // Add debug visualizer if debug is active
      if (this.debug.active) {
        this.setupColliderVisualizer()
      }
    }
  }

  setupColliderVisualizer() {
    // Import OctreeHelper if not already imported
    import('three/addons/helpers/OctreeHelper.js').then(({ OctreeHelper }) => {
      this.octreeHelper = new OctreeHelper(this.worldOctree)
      this.octreeHelper.visible = false
      this.scene.add(this.octreeHelper)

      // Add to debug panel
      const colliderFolder = this.debug.ui.addFolder({
        title: 'Collider System',
        expanded: false,
      })

      colliderFolder.addBinding(
        { visualize: false },
        'visualize',
        {
          label: 'Show Collider',
        },
      ).on('change', (event) => {
        this.octreeHelper.visible = event.value
      })

      // Add capsule helper to visualize player collider
      const geometry = new THREE.CapsuleGeometry(
        this.playerCollider.radius,
        this.playerCollider.end.y - this.playerCollider.start.y,
        4,
        8,
      )
      const material = new THREE.MeshBasicMaterial({
        color: 0x00FF00,
        wireframe: true,
      })
      this.capsuleHelper = new THREE.Mesh(geometry, material)
      this.capsuleHelper.visible = false
      this.scene.add(this.capsuleHelper)

      colliderFolder.addBinding(
        { playerCollider: false },
        'playerCollider',
        {
          label: 'Show Character Collider',
        },
      ).on('change', (event) => {
        this.capsuleHelper.visible = event.value
      })
    })
  }

  setupAnimations() {
    this.mixer = new THREE.AnimationMixer(this.hero)

    // Get all animations from the model
    const animations = this.resources.items.heroModel.animations

    // Store animations in a map for easy access
    animations.forEach((animation) => {
      this.animations[animation.name] = this.mixer.clipAction(animation)
      console.warn(`Add animation: ${animation.name}, duration: ${animation.duration}s`)
    })

    // Play idle animation by default
    this.playAnimation('idle')
  }

  setupEventListeners() {
    
    this.actions = {
      up: false,
      down: false,
      left: false,
      right: false,
      brake: false,
      boost: false,
      reset: false,
    }

    
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.actions.up = true
          this.keys.w = true
          this.keys.arrowUp = true
          break

        case 'ArrowDown':
        case 'KeyS':
          this.actions.down = true
          this.keys.s = true
          this.keys.arrowDown = true
          break

        case 'ArrowLeft':
        case 'KeyA':
          this.actions.left = true
          this.keys.a = true
          this.keys.arrowLeft = true
          break

        case 'ArrowRight':
        case 'KeyD':
          this.actions.right = true
          this.keys.d = true
          this.keys.arrowRight = true
          break

        case 'ControlLeft':
        case 'ControlRight':
        case 'Space':
          this.actions.brake = true
          this.keys.space = true
          
          if (e.code === 'Space' && this.playerOnFloor && !this.character.isSitting) {
            this.jump()
          }
          break

        case 'ShiftLeft':
        case 'ShiftRight':
          this.actions.boost = true
          break

        case 'KeyR':
          this.actions.reset = true
          
          this.resetPosition()
          break

        case 'KeyZ':
          this.toggleSit()
          break
      }
    })

    
    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.actions.up = false
          this.keys.w = false
          this.keys.arrowUp = false
          break

        case 'ArrowDown':
        case 'KeyS':
          this.actions.down = false
          this.keys.s = false
          this.keys.arrowDown = false
          break

        case 'ArrowLeft':
        case 'KeyA':
          this.actions.left = false
          this.keys.a = false
          this.keys.arrowLeft = false
          break

        case 'ArrowRight':
        case 'KeyD':
          this.actions.right = false
          this.keys.d = false
          this.keys.arrowRight = false
          break

        case 'ControlLeft':
        case 'ControlRight':
        case 'Space':
          this.actions.brake = false
          this.keys.space = false
          break

        case 'ShiftLeft':
        case 'ShiftRight':
          this.actions.boost = false
          break

        case 'KeyR':
          this.actions.reset = false
          break
      }
    })
  }

  
  setupControlsListeners() {
    if (this.controls) {
      this.controls.addEventListener('start', () => {
        this.isUserInteracting = true
      })
      this.controls.addEventListener('end', () => {
        this.isUserInteracting = false
      })
    }
    else {
      console.warn('OrbitControls not found in Camera instance.')
    }
  }

  moveCharacter(deltaTime) {
    if (this.character.isSitting)
      return

    
    let moveX = 0
    let moveZ = 0
    let newDirection = null

    
    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.GRAVITY * deltaTime
    }

    
    const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8)

    
    if (this.actions.up) {
      moveZ = -speedDelta
      newDirection = new THREE.Vector3(0, 0, 1) 
    }
    else if (this.actions.down) {
      moveZ = speedDelta
      newDirection = new THREE.Vector3(0, 0, -1) 
    }
    else if (this.actions.left) {
      moveX = -speedDelta
      newDirection = new THREE.Vector3(1, 0, 0) 
    }
    else if (this.actions.right) {
      moveX = speedDelta
      newDirection = new THREE.Vector3(-1, 0, 0) 
    }

    
    if (moveX !== 0 || moveZ !== 0) {
      
      this.updateCharacterRotation(newDirection)

      
      if (this.playerOnFloor && this.currentAnimation !== this.animations.jump) {
        this.playAnimation('walk')
      }

      
      if (moveX !== 0) {
        this.playerVelocity.x += moveX
      }
      if (moveZ !== 0) {
        this.playerVelocity.z += moveZ
      }
    }
    else if (this.playerOnFloor) {
      
      if (!this.character.isSitting && this.currentAnimation !== this.animations.jump) {
        this.playAnimation('idle')
      }
    }

    
    const damping = Math.exp(-4 * deltaTime) - 1
    this.playerVelocity.addScaledVector(this.playerVelocity, damping)

    
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime)
    this.playerCollider.translate(deltaPosition)

    
    this.updateAnimationState()
  }

  updateAnimationState() {
    
    if (this.playerOnFloor && this.currentAnimation === this.animations.jump) {
      
      const isMoving = this.actions.up || this.actions.down || this.actions.left || this.actions.right

      
      if (isMoving) {
        this.playAnimation('walk')
      }
      else {
        this.playAnimation('idle')
      }
    }

    
    if (!this.playerOnFloor && this.playerVelocity.y < 0 && this.currentAnimation !== this.animations.fall) {
      this.playAnimation('fall')
    }
  }

  playerCollisions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider)
    this.playerOnFloor = false

    if (result) {
      this.playerOnFloor = result.normal.y > 0

      if (!this.playerOnFloor) {
        // Slide along the surface if falling
        this.playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.playerVelocity),
        )
      }

      // Adjust position to prevent clipping
      if (result.depth >= 1e-10) {
        this.playerCollider.translate(result.normal.multiplyScalar(result.depth))
      }
    }
  }

  updateModelFromCollider() {
    // Get center position between collider start and end
    const center = new THREE.Vector3()
      .addVectors(this.playerCollider.start, this.playerCollider.end)
      .multiplyScalar(0.5)

    // Update hero position
    this.hero.position.copy(center)
    this.hero.position.y -= 0.7 // Adjust height to make feet touch ground

    // Update capsule helper position if it exists
    if (this.capsuleHelper) {
      this.capsuleHelper.position.copy(center)
    }
  }

  updateCharacterRotation(newDirection) {
    if (!newDirection || this.character.currentDirection.equals(newDirection))
      return

    // Store new direction
    this.character.currentDirection = newDirection

    // Calculate the appropriate rotation based on direction
    let targetRotation = 0

    if (newDirection.z === -1) {
      targetRotation = 0 // Facing -Z
    }
    else if (newDirection.z === 1) {
      targetRotation = Math.PI // Facing +Z
    }
    else if (newDirection.x === -1) {
      targetRotation = Math.PI / 2 // Facing -X
    }
    else if (newDirection.x === 1) {
      targetRotation = -Math.PI / 2 // Facing +X
    }

    // Get the current rotation
    const currentRotation = this.character.instance.rotation.y

    // Calculate the difference between the current rotation and the target rotation
    let deltaRotation = targetRotation - currentRotation

    
    deltaRotation = ((deltaRotation + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI

    // Calculate the new target rotation
    const newTargetRotation = currentRotation + deltaRotation

    // Animate rotation
    gsap.to(this.character.instance.rotation, {
      y: newTargetRotation,
      duration: 0.2,
      ease: 'power1.out',
    })
  }

  toggleSit() {
    if (this.character.isMoving)
      return

    this.character.isSitting = !this.character.isSitting

    if (this.character.isSitting) {
      this.playAnimation('sit')
    }
    else {
      this.playAnimation('idle')
    }
  }

  playAnimation(name) {
    if (!this.animations[name])
      return

    // If we're already playing this animation, don't restart it
    if (this.currentAnimation === this.animations[name])
      return

    // Fade out current animation if exists
    if (this.currentAnimation) {
      this.currentAnimation.fadeOut(0.2)
    }

    // Fade in new animation
    const newAnimation = this.animations[name]
    newAnimation.reset()
    newAnimation.fadeIn(0.2)

    // Ensure animations loop properly
    newAnimation.setLoop(THREE.LoopRepeat)
    newAnimation.play()

    // Store current animation
    this.currentAnimation = newAnimation
  }

  jump() {
    // Apply upward velocity for jumping
    if (this.playerOnFloor) {
      this.playerVelocity.y = 10
      this.playerOnFloor = false
      this.playAnimation('jump')
    }
  }

  // #region
  
  debugInit() {
    
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Character Anim Control',
      expanded: false,
    })

    
    const infoFolder = this.debugFolder.addFolder({
      title: 'Basic Info',
      expanded: true,
    })

    
    infoFolder.addBinding(
      {
        Total_Animations: this.animation.clips.length,
        Current_Animation: this.animation.current,
      },
      'Total Animations',
      {
        readonly: true,
      },
    )

    infoFolder.addBinding(
      {
        Current_Animation: this.animation.current,
      },
      'Current Animation',
      {
        readonly: true,
      },
    )

    
    const animSelectFolder = this.debugFolder.addFolder({
      title: 'Animation Selection',
      expanded: true,
    })

    
    const animationOptions = {}
    this.animation.clips.forEach((clip) => {
      animationOptions[clip.name] = clip.name
    })

    
    this.debugAnimation = {
      currentAnimation: this.animation.current,
    }

    animSelectFolder.addBinding(
      this.debugAnimation,
      'currentAnimation',
      {
        label: 'Switch Animation',
        options: animationOptions,
      },
    ).on('change', (event) => {
      this.playAnimation(event.value)
    })

    
    const animParamsFolder = this.debugFolder.addFolder({
      title: 'Animation Parameters',
      expanded: true,
    })

    
    animParamsFolder.addBinding(
      this.animationParams,
      'timeScale',
      {
        label: 'Playback Speed',
        min: 0.1,
        max: 2,
        step: 0.1,
      },
    ).on('change', (event) => {
      
      Object.values(this.animation.actions).forEach((action) => {
        action.setEffectiveTimeScale(event.value)
      })
    })

    
    animParamsFolder.addBinding(
      this.animationParams,
      'fadeInDuration',
      {
        label: 'Fade-in Duration',
        min: 0.1,
        max: 2.0,
        step: 0.1,
      },
    )

    animParamsFolder.addBinding(
      this.animationParams,
      'fadeOutDuration',
      {
        label: 'Fade-out Duration',
        min: 0.1,
        max: 2.0,
        step: 0.1,
      },
    )

    
    animParamsFolder.addBinding(
      this.animationParams,
      'paused',
      {
        label: 'Pause',
      },
    ).on('change', (event) => {
      if (event.value) {
        this.animation.mixer.timeScale = 0
      }
      else {
        this.animation.mixer.timeScale = 1
      }
    })

    
    this.debugAnimation.loopMode = 'LoopRepeat'
    const loopModes = {
      LoopOnce: THREE.LoopOnce,
      LoopRepeat: THREE.LoopRepeat,
      LoopPingPong: THREE.LoopPingPong,
    }

    animParamsFolder.addBinding(
      this.debugAnimation,
      'loopMode',
      {
        label: 'Loop Mode',
        options: {
          Play_Once: 'LoopOnce',
          Loop_Repeat: 'LoopRepeat',
          Loop_PingPong: 'LoopPingPong',
        },
      },
    ).on('change', (event) => {
      
      const action = this.animation.actions[this.animation.current]
      action.setLoop(loopModes[event.value])

      if (event.value === 'LoopOnce') {
        action.clampWhenFinished = true
      }
    })

    
    const animButtonsFolder = this.debugFolder.addFolder({
      title: 'Animation Operations',
      expanded: true,
    })

    
    animButtonsFolder.addButton({
      title: 'Reset Animation',
    }).on('click', () => {
      const action = this.animation.actions[this.animation.current]
      action.reset().play()
    })

    
    animButtonsFolder.addButton({
      title: 'Stop All Animations',
    }).on('click', () => {
      Object.values(this.animation.actions).forEach((action) => {
        action.stop()
      })
    })

    
    animButtonsFolder.addButton({
      title: 'Reactivate Current Animation',
    }).on('click', () => {
      
      const currentAnimation = this.animation.current
      this.animation.actions[currentAnimation].stop()
      this.animation.actions[currentAnimation].reset()
      this.animation.actions[currentAnimation].play()
    })

    
    const transformFolder = this.debug.ui.addFolder({
      title: 'Character Transform Control',
      expanded: false,
    })

    
    transformFolder.addBinding(
      this.heroParams,
      'position',
      {
        label: 'Position',
        x: { min: -50, max: 50, step: 0.1 },
        y: { min: -50, max: 50, step: 0.1 },
        z: { min: -50, max: 50, step: 0.1 },
      },
    ).on('change', () => {
      this.hero.position.copy(this.heroParams.position)
    })

    
    transformFolder.addBinding(
      this.heroParams,
      'rotation',
      {
        label: 'Rotation',
        x: { min: -Math.PI, max: Math.PI, step: 0.1 },
        y: { min: -Math.PI, max: Math.PI, step: 0.1 },
        z: { min: -Math.PI, max: Math.PI, step: 0.1 },
      },
    ).on('change', () => {
      this.hero.rotation.copy(this.heroParams.rotation)
    })

    
    transformFolder.addBinding(
      this.heroParams,
      'scale',
      {
        label: 'Scale',
        x: { min: 0.1, max: 5, step: 0.1 },
        y: { min: 0.1, max: 5, step: 0.1 },
        z: { min: 0.1, max: 5, step: 0.1 },
      },
    ).on('change', () => {
      this.hero.scale.copy(this.heroParams.scale)
    })

    
    transformFolder.addBinding(
      this.heroParams,
      'visible',
      {
        label: 'Visibility',
      },
    ).on('change', () => {
      this.hero.visible = this.heroParams.visible
    })

    
    this.skeletonVisible = true
    transformFolder.addBinding(
      this,
      'skeletonVisible',
      {
        label: 'Show Skeleton',
      },
    ).on('change', (event) => {
      
      this.scene.traverse((object) => {
        if (object instanceof THREE.SkeletonHelper) {
          object.visible = event.value
        }
      })
    })

    // Add camera follow controls to debug panel
    const cameraFolder = this.debug.ui.addFolder({
      title: 'Camera Tracking Settings',
      expanded: false,
    })

    // Camera offset controls
    cameraFolder.addBinding(
      this.cameraOffset,
      'x',
      {
        label: 'Camera X Offset',
        min: -10,
        max: 10,
        step: 0.1,
      },
    )

    cameraFolder.addBinding(
      this.cameraOffset,
      'y',
      {
        label: 'Camera Y Offset',
        min: -10,
        max: 10,
        step: 0.1,
      },
    )

    cameraFolder.addBinding(
      this.cameraOffset,
      'z',
      {
        label: 'Camera Z Offset',
        min: -10,
        max: 10,
        step: 0.1,
      },
    )

    // Camera smoothing control
    cameraFolder.addBinding(
      this,
      'cameraLerpFactor',
      {
        label: 'Camera Smoothness',
        min: 0.01,
        max: 0.5,
        step: 0.01,
      },
    )
  }

  // #endregion
  update() {
    const deltaTime = this.time.delta / 1000

    
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }

    
    const isAnyMovementKeyPressed = this.actions.up || this.actions.down || this.actions.left || this.actions.right

    
    if (!this.character.isSitting) {
      this.moveCharacter(deltaTime)
    }
    else if (!isAnyMovementKeyPressed && this.playerOnFloor) {
      
      const damping = Math.exp(-10 * deltaTime) - 1
      this.playerVelocity.addScaledVector(this.playerVelocity, damping)

      
      const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime)
      this.playerCollider.translate(deltaPosition)
    }
    this.playerCollisions()
    this.updateModelFromCollider()

    
    if (this.hero.position.y < -20) {
      this.resetPosition()
    }

    
    this.updateCamera()
  }

  updateCamera() {
    // Calculate target camera position based on character's position and rotation
    const characterPosition = this.hero.position.clone()

    // Set camera look-at point (slightly above character's position)
    this.cameraLookAt.copy(characterPosition)
    this.cameraLookAt.y += 1.5 // Look at character's upper body
    
    if (this.isUserInteracting) {
      this.camera.lookAt(this.cameraLookAt)
      return
    }

    // Set camera target position
    this.cameraTarget.copy(characterPosition).add(new THREE.Vector3(10, 12, 15))

    // Smoothly move camera to target position
    this.camera.position.lerp(this.cameraTarget, this.cameraLerpFactor)

    // Make camera look at the target point
    this.camera.lookAt(this.cameraLookAt)
  }

  
  resetPosition() {
    
    this.hero.position.set(37, 10, 6)
    this.hero.scale.set(2, 2, 2)
    this.hero.rotation.set(0, Math.PI / 2, 0)
    this.hero.visible = true
    
    this.playerCollider.start.set(
      this.hero.position.x,
      this.hero.position.y + 2.35,
      this.hero.position.z,
    )
    this.playerCollider.end.set(
      this.hero.position.x,
      this.hero.position.y + 3,
      this.hero.position.z,
    )
    
    this.playerVelocity.set(0, 0, 0)
    
    this.playAnimation('idle')
  }
}

// Updated on 2026-08-28
