<template>
  <a-config-provider :theme="themeConfig" :locale="antdLocale">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { theme as antdTheme } from 'ant-design-vue'
import { getAntdLocale } from '@/locales/antd'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const antdLocale = computed(() => getAntdLocale(appStore.locale))

const themeConfig = computed(() => ({
  // 只使用 Ant Design 默认算法，不再区分暗黑模式
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: appStore.primaryColor,
  },
}))
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>

