import Experience from '../experience.js'
import EventPoint from './eventPoint.js'


export default class EventPointManager {
  constructor() {
    this.experience = new Experience()
    this.eventPoints = new Map() 
    this.debug = this.experience.debug

    
    if (this.debug?.active) {
      this.createDebugPanel()
    }
  }

  
  createDebugPanel() {
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Interaction Point Manager',
      expanded: false,
    })

    
    this.debugFolder.addBinding(
      {
        showAllTriggers: false,
      },
      'showAllTriggers',
      {
        label: 'Show All Interaction Ranges',
      },
    ).on('change', (event) => {
      this.eventPoints.forEach((point) => {
        if (point.debugSphere) {
          point.debugSphere.visible = event.value
        }
      })
    })
  }

  
  createEventPoint(id, position, radius, callback, interactionText, iconName) {
    
    if (this.eventPoints.has(id)) {
      console.warn(`Event point ${id} already exists, will be replaced`)
      this.removeEventPoint(id)
    }

    
    const eventPoint = new EventPoint(position, radius, callback, interactionText, iconName)
    this.eventPoints.set(id, eventPoint)

    console.warn(`Create event point ${id}, position: ${position.toArray().join(',')}`)
    return eventPoint
  }

  
  removeEventPoint(id) {
    const eventPoint = this.eventPoints.get(id)
    if (eventPoint) {
      eventPoint.destroy() 
      this.eventPoints.delete(id)
      console.warn(`Remove event point ${id}`)
    }
  }

  
  getEventPoint(id) {
    return this.eventPoints.get(id)
  }

  
  clearAllEventPoints() {
    this.eventPoints.forEach((point, id) => {
      point.destroy()
      console.warn(`Clean event point ${id}`)
    })
    this.eventPoints.clear()
  }

  
  update() {
    
    if (!this.experience.world?.hero?.hero) {
      // console.warn('EventPointManager update skipped: Hero not ready');
      return
    }
    
    this.eventPoints.forEach((point) => {
      point.update()
    })
  }

  
  destroy() {
    this.clearAllEventPoints()
    
  }
}

// Updated on 2026-08-28
 
