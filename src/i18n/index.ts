import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import sv from '@/locales/sv.json'
import type { AppLanguage } from '@/types'

const LOCALE_STORAGE_KEY = 'appLocale'

export function getStoredLocale(): AppLanguage | null {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'sv') return stored
  return null
}

export function setStoredLocale(language: AppLanguage) {
  localStorage.setItem(LOCALE_STORAGE_KEY, language)
}

function getBrowserLocale(): AppLanguage {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('sv')) return 'sv'
  return 'en'
}

export function getInitialLocale(): AppLanguage {
  return getStoredLocale() ?? getBrowserLocale()
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, sv },
})

export function setAppLocale(language: AppLanguage, persist = true) {
  i18n.global.locale.value = language
  document.documentElement.lang = language
  if (persist) {
    setStoredLocale(language)
  }
}

export function getCurrentLocale(): AppLanguage {
  return i18n.global.locale.value as AppLanguage
}
