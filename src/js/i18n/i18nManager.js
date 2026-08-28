import { translations } from './translations'

export default class I18nManager {
  constructor() {
    
    if (I18nManager.instance) {
      return I18nManager.instance
    }
    I18nManager.instance = this

    // Initialize language (English / Tamil only)
    const savedLang = localStorage.getItem('lang')
    this.currentLang = (savedLang === 'en' || savedLang === 'ta') ? savedLang : 'en'
    this.translations = translations

    this.listeners = new Set()
  }

  /**
   * Get current language code
   * @returns {string}
   */
  getCurrentLang() {
    return this.currentLang
  }

  /**
   * Set language
   * @param {string} lang - Target language code ('en' | 'ta')
   */
  setLang(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang
      localStorage.setItem('lang', lang)
      this.notifyListeners()
    }
    else {
      console.warn(`Unsupported language: ${lang}`)
    }
  }

  /**
   * Get translated text
   * @param {string} path - Path like 'intro.vision'
   * @returns {string}
   */
  t(path) {
    const keys = path.split('.')
    let result = this.translations[this.currentLang]

    for (const key of keys) {
      if (result && result[key]) {
        result = result[key]
      }
      else {
        console.warn(`Translation path not found: ${path}`)
        return path
      }
    }

    return result
  }

  /**
   * Add language-change listener
   * @param {Function} listener
   */
  addListener(listener) {
    this.listeners.add(listener)
  }

  /**
   * Remove language-change listener
   * @param {Function} listener
   */
  removeListener(listener) {
    this.listeners.delete(listener)
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLang))
  }
}

// Updated on 2026-08-28
 
