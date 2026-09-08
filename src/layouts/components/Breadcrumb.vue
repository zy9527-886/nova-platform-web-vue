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

const route = useRoute()

const breadcrumbList = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  return matched.map((item) => ({
    title: item.meta?.title as string,
    path: item.path,
  }))
})
</script>

