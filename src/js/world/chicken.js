import gsap from 'gsap'
import * as THREE from 'three'
import Experience from '../experience.js'
import EventPointCSS2D from './eventPointCSS2D.js'

export default class Chicken {
  constructor() {
    
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug

    
    this.bounceEase = gsap.parseEase('bounce.out')

    
    this.chickenParams = {
      scale: 0.7,
      position: { x: 22, y: -0.43, z: 3.48 },
      jumpLength: 1, 
    }

    
    this.jumpState = {
      direction: -1, 
      step: 0, 
      startX: this.chickenParams.position.x,
      startTime: this.time.elapsed * 0.001,
    }

    
    this.chickenObject = null
    
    this.interactionPrompt = new EventPointCSS2D()

    
    this.initChicken()

    
    if (this.debug.active) {
      this.debugInit()
    }
  }

  
  initChicken() {
    const chickenResource = this.resources.items.chickenModel
    if (chickenResource && chickenResource.scene) {
      this.chickenObject = chickenResource.scene
      this.chickenObject.name = 'chickenModel'
      this.chickenObject.scale.setScalar(this.chickenParams.scale)
      this.chickenObject.position.set(
        this.chickenParams.position.x,
        this.chickenParams.position.y,
        this.chickenParams.position.z,
      )
      this.scene.add(this.chickenObject)
      
      this.scene.add(this.interactionPrompt.getObject())
    }
  }

  
  update() {
    if (!this.chickenObject)
      return
    
    const bounceDuration = 0.5 
    const jumpCount = 4 
    const t = this.time.elapsed * 0.001
    let { direction, startX, startTime } = this.jumpState
    const progress = Math.min((t - startTime) / bounceDuration, 1)

    
    const jumpLength = this.chickenParams.jumpLength
    const fromX = startX
    const toX = startX + direction * jumpLength
    
    const x = THREE.MathUtils.lerp(fromX, toX, progress)
    this.chickenObject.position.x = x
    this.chickenObject.position.z = this.chickenParams.position.z
    
    const bounceProgress = this.bounceEase(progress)
    const jumpHeight = bounceProgress * 0.28
    this.chickenObject.position.y = this.chickenParams.position.y + 0.22 + jumpHeight
    // squash & stretch
    const squash = 0.85 + 0.15 * bounceProgress
    const stretch = 1.0 + 0.15 * (1 - bounceProgress)
    const baseScale = this.chickenParams.scale
    this.chickenObject.scale.set(baseScale * stretch, baseScale * squash, baseScale * stretch)
    
    this.chickenObject.rotation.y = direction === -1 ? -Math.PI / 2 : Math.PI / 2

    
    if (progress >= 1) {
      this.jumpState.step++
      this.jumpState.startX = toX
      this.jumpState.startTime = t
      
      if (this.jumpState.step >= jumpCount) {
        this.jumpState.direction *= -1
        this.jumpState.step = 0
      }
    }

    
    this.interactionPrompt.updatePosition(this.chickenObject.position)
  }

  
  showInteractionPrompt() {
    if (this.chickenObject) {
      
      const position = this.chickenObject.position.clone()
      position.y += 1.5 
      this.interactionPrompt.showInteractionPrompt(position, 'pointer_a.png')
    }
  }

  
  hideInteractionPrompt() {
    this.interactionPrompt.hideInteractionPrompt()
  }

  
  onClick() {
    window.open('https://cross-road-eight.vercel.app/', '_blank')
  }

  
  debugInit() {
    const chickenFolder = this.debug.ui.addFolder({
      title: 'Chicken Model Debug',
      expanded: true,
    })
    
    chickenFolder.addBinding(
      this.chickenParams,
      'scale',
      {
        label: 'Scale',
        min: 0.1,
        max: 5,
        step: 0.01,
      },
    )
    
    chickenFolder.addBinding(
      this.chickenParams,
      'jumpLength',
      {
        label: 'Jump Length',
        min: 0.5,
        max: 10,
        step: 0.1,
      },
    )
    
    const posFolder = chickenFolder.addFolder({
      title: 'Position',
      expanded: true,
    })
    posFolder.addBinding(this.chickenParams.position, 'x', {
      label: 'X',
      min: -100,
      max: 100,
      step: 0.01,
    })
    posFolder.addBinding(this.chickenParams.position, 'y', {
      label: 'Y',
      min: -10,
      max: 10,
      step: 0.01,
    })
    posFolder.addBinding(this.chickenParams.position, 'z', {
      label: 'Z',
      min: -100,
      max: 100,
      step: 0.01,
    })
  }
}

// Updated on 2026-08-28
 
