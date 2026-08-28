import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'


export default class EventPointCSS2D {
  constructor() {
    
    this.iconContainer = document.createElement('div')
    this.iconContainer.className = 'hidden'

    
    this.iconImage = this.createIconImage()
    this.iconContainer.appendChild(this.iconImage)

    
    document.body.appendChild(this.iconContainer)

    
    this.css2dObject = new CSS2DObject(this.iconContainer)

    
    this.isVisible = false
  }

  
  createIconImage() {
    const image = document.createElement('img')
    image.className = 'w-12 h-8 pixel-art transition-opacity duration-300 opacity-0 animate-bounce'
    return image
  }

  
  showInteractionPrompt(position, iconName = 'chat.png') {
    
    this.iconImage.src = `/icon/${iconName}`

    
    this.updatePosition(position)

    
    this.iconContainer.classList.remove('hidden')
    
    requestAnimationFrame(() => {
      this.iconImage.classList.remove('opacity-0')
    })

    this.isVisible = true
  }

  
  updatePosition(position) {
    if (this.isVisible && position) {
      this.css2dObject.position.copy(position)
      this.css2dObject.position.y += 1.5 
    }
  }

  
  hideInteractionPrompt() {
    this.iconImage.classList.add('opacity-0')
    
    this.iconContainer.classList.add('hidden')
    this.isVisible = false
  }

  
  getObject() {
    return this.css2dObject
  }

  
  destroy() {
    
    if (this.iconContainer && this.iconContainer.parentNode) {
      this.iconContainer.parentNode.removeChild(this.iconContainer)
    }
  }
}

// Updated on 2026-08-28
 