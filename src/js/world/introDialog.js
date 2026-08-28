import Typed from 'typed.js'
import I18nManager from '../i18n/i18nManager'
import EventEmitter from '../utils/event-emitter'

export default class IntroDialog extends EventEmitter {
  constructor() {
    super()

    // DOM elements
    this.dialogText = document.getElementById('dialogText')
    this.dialogContainer = this.dialogText.closest('.fixed')

    
    this.i18n = new I18nManager()

    
    this.introContent = [
      this.i18n.t('intro.vision'),
      this.i18n.t('intro.purpose'),
      this.i18n.t('intro.about'),
      this.i18n.t('intro.skills'),
      this.i18n.t('intro.contact'),
      this.i18n.t('intro.passion'),
      this.i18n.t('intro.frameworks'),
      this.i18n.t('intro.community'),
      this.i18n.t('intro.interest'),
      this.i18n.t('intro.knowledge'),
    ]

    
    this.interactionContent = {
      bed_area: this.i18n.t('areas.bed_area'),
      beer_area: this.i18n.t('areas.beer_area'),
      workbench_area: this.i18n.t('areas.workbench_area'),
      weapon_area: this.i18n.t('areas.weapon_area'),
      dining_area: this.i18n.t('areas.dining_area'),
      kitchen_area: this.i18n.t('areas.kitchen_area'),
      well_area: this.i18n.t('areas.well_area'),
    }

    this.currentIndex = 0
    this.typed = null
    this.isVisible = true
    this.hideTimer = null
    this.introLoopTimer = null
    this.lastInteractionTime = Date.now()

    
    this.on('languageChanged', () => this.updateTranslations())

    
    this.skipBtn = document.getElementById('skipDialogBtn')
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        this.stopIntroContentLoop()
        if (this.typed) {
          this.typed.destroy()
        }
        this.hideDialog()
      })
    }
  }

  
  updateTranslations() {
    
    this.introContent = [
      this.i18n.t('intro.vision'),
      this.i18n.t('intro.purpose'),
      this.i18n.t('intro.about'),
      this.i18n.t('intro.skills'),
      this.i18n.t('intro.contact'),
      this.i18n.t('intro.passion'),
      this.i18n.t('intro.frameworks'),
      this.i18n.t('intro.community'),
      this.i18n.t('intro.interest'),
      this.i18n.t('intro.knowledge'),
    ]

    
    this.interactionContent = {
      bed_area: this.i18n.t('areas.bed_area'),
      beer_area: this.i18n.t('areas.beer_area'),
      workbench_area: this.i18n.t('areas.workbench_area'),
      weapon_area: this.i18n.t('areas.weapon_area'),
      dining_area: this.i18n.t('areas.dining_area'),
      kitchen_area: this.i18n.t('areas.kitchen_area'),
      well_area: this.i18n.t('areas.well_area'),
    }

    
    this.setupTyped(this.introContent, true)
  }

  setupTyped(content, autoLoop = true) {
    if (this.typed) {
      this.typed.destroy()
    }

    
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    this.typed = new Typed(this.dialogText, {
      strings: content,
      typeSpeed: 10,
      backSpeed: 5,
      backDelay: 1500, 
      showCursor: true,
      cursorChar: '|',
      loop: autoLoop, 
    })
  }

  hideDialog() {
    
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    this.isVisible = false
    this.dialogContainer.style.transition = 'opacity 0.5s ease-out'
    this.dialogContainer.style.opacity = '0'
  }

  showDialog() {
    this.isVisible = true
    this.dialogContainer.style.opacity = '1'
  }

  
  showAreaContent(areaId) {
    
    this.lastInteractionTime = Date.now()

    
    const content = [this.interactionContent[areaId]]
    if (!content) {
      console.warn(`Area content not found: ${areaId}`)
      return
    }

    
    this.dialogText.textContent = ''

    
    this.showDialog()
    this.setupTyped(content, false) 
  }

  
  startIntroContentLoop() {
    
    this.setupTyped(this.introContent, true)
  }

  
  stopIntroContentLoop() {
    if (this.introLoopTimer) {
      clearInterval(this.introLoopTimer)
      this.introLoopTimer = null
    }
  }

  
  destroy() {
    this.stopIntroContentLoop()
    if (this.typed) {
      this.typed.destroy()
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
    }
    
    this.off('languageChanged')
  }
}

// Updated on 2026-08-28
