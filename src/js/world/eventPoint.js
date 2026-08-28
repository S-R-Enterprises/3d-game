import * as THREE from 'three'
import Experience from '../experience.js'
import EventPointCSS2D from './eventPointCSS2D.js'


export default class EventPoint {
  
  constructor(targetPosition, radius, callback, interactionText = 'Press F to interact', iconName = 'chat.png') {
    this.experience = new Experience()
    this.hero = this.experience.world?.hero 
    this.targetPosition = targetPosition 
    this.radius = radius 
    this.callback = callback 
    this.interactionText = interactionText 
    this.iconName = iconName 

    this.isHeroNearby = false 
    this.isInteractionAvailable = false 
    this.isKeyPressed = false 

    
    this.css2dManager = new EventPointCSS2D()
    this.experience.scene.add(this.css2dManager.getObject())

    
    this.fixedCss2dManager = new EventPointCSS2D()
    this.fixedCss2dManager.getObject().position.copy(this.targetPosition)
    this.fixedCss2dManager.getObject().position.y += 2 
    this.experience.scene.add(this.fixedCss2dManager.getObject())
    this.fixedCss2dManager.showInteractionPrompt(this.targetPosition, 'marker.png') 

    
    if (this.experience.debug?.active) {
      this.createDebugSphere()
    }

    
    this.setupEventListeners()
  }

  
  createDebugSphere() {
    const geometry = new THREE.SphereGeometry(this.radius, 16, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00FF00,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })
    this.debugSphere = new THREE.Mesh(geometry, material)
    this.debugSphere.position.copy(this.targetPosition)
    this.experience.scene.add(this.debugSphere)
  }

  
  setupEventListeners() {
    
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f' && !this.isKeyPressed && this.isInteractionAvailable) {
        this.isKeyPressed = true
        this.triggerInteraction()
      }
    })

    
    window.addEventListener('keyup', (e) => {
      if (e.key.toLowerCase() === 'f') {
        this.isKeyPressed = false
      }
    })
  }

  
  triggerInteraction() {
    if (this.isInteractionAvailable) {
      this.callback()
    }
  }

  
  showInteractionPrompt() {
    
    const heroPosition = this.hero.hero.position
    this.css2dManager.showInteractionPrompt(heroPosition, this.iconName)
  }

  
  hideInteractionPrompt() {
    this.css2dManager.hideInteractionPrompt()
  }

  
  update() {
    
    if (!this.hero) {
      this.hero = this.experience.world?.hero
      if (!this.hero || !this.hero.hero) {
        return 
      }
    }

    const heroPosition = this.hero.hero.position 
    const distance = heroPosition.distanceTo(this.targetPosition) 

    const wasHeroNearby = this.isHeroNearby 
    this.isHeroNearby = distance < this.radius 

    
    this.isInteractionAvailable = this.isHeroNearby

    
    if (this.isHeroNearby !== wasHeroNearby) {
      if (this.isHeroNearby) {
        
        this.showInteractionPrompt()
        if (this.debugSphere) {
          this.debugSphere.material.color.setHex(0xFF0000)
        }
      }
      else {
        
        this.hideInteractionPrompt()
        if (this.debugSphere) {
          this.debugSphere.material.color.setHex(0x00FF00)
        }
      }
    }

    
    if (this.isHeroNearby) {
      this.css2dManager.updatePosition(heroPosition)
    }

    
    if (this.debugSphere && this.isInteractionAvailable) {
      this.debugSphere.material.opacity = 0.5
    }
    else if (this.debugSphere) {
      this.debugSphere.material.opacity = 0.3
    }
  }

  
  destroy() {
    
    window.removeEventListener('keydown', this.setupEventListeners)
    window.removeEventListener('keyup', this.setupEventListeners)

    
    this.experience.scene.remove(this.css2dManager.getObject())
    this.css2dManager.destroy()

    
    this.experience.scene.remove(this.fixedCss2dManager.getObject())
    this.fixedCss2dManager.destroy()

    
    if (this.debugSphere) {
      this.experience.scene.remove(this.debugSphere)
      this.debugSphere.geometry.dispose()
      this.debugSphere.material.dispose()
    }
  }
}

// Updated on 2026-08-28
 
