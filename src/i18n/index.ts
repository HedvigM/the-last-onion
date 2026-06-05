import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import sv from '@/locales/sv.json'
import type { AppLanguage } from '@/types'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, sv },
})

export function setAppLocale(language: AppLanguage) {
  i18n.global.locale.value = language
  document.documentElement.lang = language
}
