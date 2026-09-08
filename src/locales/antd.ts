import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import zhTW from 'ant-design-vue/es/locale/zh_TW'

import type { AppLocale } from './types'

const sw = {
  ...enUS,
  locale: 'sw',
  Empty: { description: 'Hakuna data' },
  Modal: { okText: 'Sawa', cancelText: 'Ghairi', justOkText: 'Sawa' },
  Pagination: {
    ...enUS.Pagination,
    items_per_page: '/ ukurasa',
    jump_to: 'Nenda',
    jump_to_confirm: 'thibitisha',
    page: 'Ukurasa',
    prev_page: 'Ukurasa uliopita',
    next_page: 'Ukurasa unaofuata',
    prev_5: 'Kurasa 5 zilizopita',
    next_5: 'Kurasa 5 zinazofuata',
  },
}

const antdLocales = { 'zh-CN': zhCN, 'zh-TW': zhTW, en: enUS, sw }
export const getAntdLocale = (locale: AppLocale) => antdLocales[locale]
