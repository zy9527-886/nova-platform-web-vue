<template>
  <a-card :bordered="false" class="search-panel" :class="{ 'search-panel--collapsed': collapsed }">
    <div v-show="!collapsed" class="search-panel__content"><slot /></div>
    <a-tooltip :title="collapsed ? t('common.expandSearch') : t('common.collapseSearch')">
      <a-button
        type="text"
        size="small"
        class="search-panel__toggle"
        :aria-label="collapsed ? t('common.expandSearch') : t('common.collapseSearch')"
        @click="collapsed = !collapsed"
      >
        <DownOutlined v-if="collapsed" />
        <UpOutlined v-else />
      </a-button>
    </a-tooltip>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'

const collapsed = ref(true)
const { t } = useI18n()
</script>
