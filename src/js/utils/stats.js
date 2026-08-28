import Stats from 'three/examples/jsm/libs/stats.module'

export default class StatsPanel {
  constructor() {
    this.active = window.location.hash === '#debug'
    if (this.active) {
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.append(this.stats.dom)

      
      this.stats.dom.style.width = '200px' 
      this.stats.dom.style.height = '100px' 
      this.stats.dom.style.fontSize = '16px' 
    }
  }

  update() {
    if (this.active) {
      this.stats.update()
    }
  }
}

// Updated on 2026-08-28
