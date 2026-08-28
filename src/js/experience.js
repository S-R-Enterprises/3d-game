import * as THREE from 'three'

import Camera from './camera.js'
import LanguageSwitcher from './components/languageSwitcher'
import Renderer from './renderer.js'
import sources from './sources.js'
import Debug from './utils/debug.js'
import IMouse from './utils/imouse.js'
import Resources from './utils/resources.js'
import Sizes from './utils/sizes.js'
import Stats from './utils/stats.js'
import Time from './utils/time.js'
import PhysicsWorld from './world/physics-world.js'
import World from './world/world.js'

let instance

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (instance) {
      return instance
    }

    instance = this

    // Global access
    window.Experience = this

    this.canvas = canvas

    // Panel
    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.camera = new Camera(true) 
    this.renderer = new Renderer()
    this.resources = new Resources(sources)
    this.physics = new PhysicsWorld()
    this.iMouse = new IMouse()
    this.world = new World()

    
    this.languageSwitcher = new LanguageSwitcher()

    
    if (this.world.introDialog) {
      this.languageSwitcher.on('languageChanged', (lang) => {
        this.world.introDialog.trigger('languageChanged', lang)
      })
    }

    this.sizes.on('resize', () => {
      this.resize()
    })

    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
    if (this.world && this.world.resize) {
      this.world.resize()
    }
  }

  update() {
    if (this.stats) {
      this.stats.update()
    }
    this.camera.update()

    if (this.world) {
      this.world.update()
      if (this.world.area && this.world.area.update) {
        this.world.area.update()
      }
    }

    if (this.physics) {
      // ... existing code ...
    }

    // this.renderer.update()

    if (this.debug.active) {
      // ... existing code ...
    }

    this.iMouse.update()

    
    window.addEventListener('keydown', (event) => {
      
      if ((event.key === 'r' || event.key === 'R') && this.world && this.world.hero && typeof this.world.hero.resetPosition === 'function') {
        this.world.hero.resetPosition()
      }
    })
  }

  destroy() {
    // ... existing code ...
  }
}

// Updated on 2026-08-28
