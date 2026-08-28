import I18nManager from '../i18n/i18nManager'
import EventEmitter from '../utils/event-emitter'

export default class LanguageSwitcher extends EventEmitter {
  constructor() {
    super()

    // Get i18n manager instance
    this.i18n = new I18nManager()

    // Bind i18n button click events
    this.bindEvents()
  }

  bindEvents() {
    const i18nButton = document.getElementById('i18nToggle')
    if (!i18nButton) {
      console.warn('i18n toggle button not found')
      return
    }

    i18nButton.addEventListener('click', (event) => {
      const currentLang = this.i18n.getCurrentLang()
      // Toggle between English and Tamil
      const newLang = currentLang === 'en' ? 'ta' : 'en'
      this.i18n.setLang(newLang)

      this.trigger('languageChanged', newLang)
      this.updateButtonState(newLang)

      event.currentTarget.blur()
    })

    this.updateButtonState(this.i18n.getCurrentLang())
  }

  /**
   * Update button icon for current language
   * @param {string} lang - Current language code
   */
  updateButtonState(lang) {
    const i18nButton = document.getElementById('i18nToggle')
    if (!i18nButton)
      return

    // Show the language you can switch TO
    if (lang === 'ta') {
      // Current is Tamil, so button should show 'A' to switch to English
      i18nButton.innerHTML = `<span style="font-size: 28px; font-weight: 900; color: #f6b539; font-family: monospace; user-select: none;">A</span>`
      i18nButton.title = 'Switch to English'
    } else {
      // Current is English, so button should show 'த' to switch to Tamil
      i18nButton.innerHTML = `<span style="font-size: 28px; font-weight: 900; color: #f6b539; font-family: sans-serif; user-select: none;">த</span>`
      i18nButton.title = 'Switch to Tamil'
    }
  }
}

// Updated on 2026-08-28
 
