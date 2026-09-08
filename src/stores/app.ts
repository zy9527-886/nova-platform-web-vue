import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Storage } from '@/utils/storage'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/sw'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import { setI18nLocale } from '@/locales'
import { getDayjsLocale, normalizeLocale, type AppLocale } from '@/locales/types'

const TABS_KEY = 'app_tabs_list'
const LOCALE_KEY = 'app_locale'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const collapsed = ref<boolean>(false)

  // 多标签页数据 - 从本地存储恢复
  const savedTabs = Storage.get<Array<{ path: string; title: string; closable?: boolean }>>(TABS_KEY)
  const tabsList = ref<Array<{ path: string; title: string; closable?: boolean }>>(savedTabs || [])

  // 监听 tabsList 变化，自动持久化
  watch(
    tabsList,
    newTabs => {
      Storage.set(TABS_KEY, newTabs)
    },
    { deep: true },
  )

  // 主题
  const theme = ref<'light' | 'dark'>('dark')

  const savedLocale = Storage.get<AppLocale>(LOCALE_KEY)
  const browserLocale = typeof navigator === 'undefined' ? undefined : navigator.language
  const locale = ref<AppLocale>(normalizeLocale(savedLocale || browserLocale))

  const applyLocale = (value: AppLocale) => {
    setI18nLocale(value)
    dayjs.locale(getDayjsLocale(value))
  }

  const setLocale = (value: AppLocale) => {
    locale.value = value
    Storage.set(LOCALE_KEY, value)
    applyLocale(value)
  }

  applyLocale(locale.value)

  // 视图刷新标记
  const refreshPath = ref('')
  const refreshStamp = ref(0)

  // 切换侧边栏
  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  // 设置侧边栏状态
  const setCollapsed = (val: boolean) => {
    collapsed.value = val
  }

  // 添加标签页
  const addTab = (tab: { path: string; title: string; closable?: boolean }) => {
    const exists = tabsList.value.find(item => item.path === tab.path)
    if (!exists) {
      tabsList.value.push(tab)
    }
  }

  // 移除标签页
  const removeTab = (path: string) => {
    const index = tabsList.value.findIndex(item => item.path === path)
    if (index > -1) {
      tabsList.value.splice(index, 1)
    }
  }

  // 清空标签页
  const clearTabs = () => {
    tabsList.value = []
  }

  // 关闭其他标签页
  const closeOtherTabs = (path: string) => {
    tabsList.value = tabsList.value.filter(tab => tab.path === path)
  }

  // 关闭左侧标签页
  const closeLeftTabs = (path: string) => {
    const index = tabsList.value.findIndex(tab => tab.path === path)
    if (index > -1) {
      tabsList.value = tabsList.value.slice(index)
    }
  }

  // 关闭右侧标签页
  const closeRightTabs = (path: string) => {
    const index = tabsList.value.findIndex(tab => tab.path === path)
    if (index > -1) {
      tabsList.value = tabsList.value.slice(0, index + 1)
    }
  }

  // 设置主题
  const setTheme = (val: 'light' | 'dark') => {
    theme.value = val
    // 应用主题到 body
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${val}`)
  }

  // 刷新指定路由（用于重新挂载当前视图）
  const triggerRefresh = (path: string) => {
    refreshPath.value = path
    refreshStamp.value = Date.now()
  }

  return {
    collapsed,
    tabsList,
    theme,
    locale,
    refreshPath,
    refreshStamp,
    toggleCollapsed,
    setCollapsed,
    addTab,
    removeTab,
    clearTabs,
    closeOtherTabs,
    closeLeftTabs,
    closeRightTabs,
    setTheme,
    setLocale,
    triggerRefresh,
  }
})
