<template>
  <div class="error-page">
    <a-result status="404" title="404" :sub-title="t('error.pageNotFound')">
      <template #extra>
        <a-button type="primary" @click="goHome">{{ t('error.backHome') }}</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}
</style>
