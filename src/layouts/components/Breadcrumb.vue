<template>
  <a-breadcrumb>
    <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
      <span>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const breadcrumbList = computed(() => {
  const matched = route.matched.filter((item) => item.meta && (item.meta.titleKey || item.meta.title))
  return matched.map((item) => ({
    title: typeof item.meta.titleKey === 'string' ? t(item.meta.titleKey) : item.meta.title as string,
    path: item.path,
  }))
})
</script>

