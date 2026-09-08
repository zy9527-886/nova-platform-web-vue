<template>
  <a-config-provider :theme="themeConfig" :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { theme as antdTheme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const themeConfig = {
  // 只使用 Ant Design 默认算法，不再区分暗黑模式
  algorithm: antdTheme.defaultAlgorithm,
}
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>

