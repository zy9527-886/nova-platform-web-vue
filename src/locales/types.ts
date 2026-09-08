export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en', 'sw'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: AppLocale = 'zh-CN'

const dayjsLocales: Record<AppLocale, string> = {
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  en: 'en',
  sw: 'sw',
}

export const getDayjsLocale = (locale: AppLocale) => dayjsLocales[locale]

export const normalizeLocale = (value?: string | null): AppLocale => {
  const locale = value?.toLowerCase()
  if (locale?.startsWith('zh-tw') || locale?.startsWith('zh-hk')) return 'zh-TW'
  if (locale?.startsWith('zh')) return 'zh-CN'
  if (locale?.startsWith('en')) return 'en'
  if (locale?.startsWith('sw')) return 'sw'
  return DEFAULT_LOCALE
}
