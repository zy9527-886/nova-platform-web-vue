import { createI18n } from 'vue-i18n'

import en from './messages/en'
import sw from './messages/sw'
import zhCN from './messages/zh-CN'
import zhTW from './messages/zh-TW'
import { DEFAULT_LOCALE, type AppLocale } from './types'

export const messages = { 'zh-CN': zhCN, 'zh-TW': zhTW, en, sw }

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})

export const setI18nLocale = (locale: AppLocale) => {
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

export default i18n
