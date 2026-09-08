<template>
  <div class="settings-container">
    <a-row :gutter="24">
      <!-- 左侧导航 -->
      <a-col :span="6">
        <a-card :bordered="false" class="settings-nav">
          <a-menu v-model:selected-keys="selectedKeys" mode="inline" @select="handleMenuSelect">
            <a-menu-item key="basic">
              <SettingOutlined />
              <span>{{ t('settings.basic') }}</span>
            </a-menu-item>
            <a-menu-item key="security">
              <SafetyOutlined />
              <span>{{ t('settings.security') }}</span>
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-col>

      <!-- 右侧内容 -->
      <a-col :span="18">
        <a-card :bordered="false" class="settings-content">
          <template #title>
            <span>{{ currentTitle }}</span>
          </template>

          <!-- 基础设置 -->
          <BasicSettings v-if="currentKey === 'basic'" />

          <!-- 安全设置 -->
          <SecuritySettings v-if="currentKey === 'security'" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SettingOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import BasicSettings from './components/BasicSettings.vue'
import SecuritySettings from './components/SecuritySettings.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const selectedKeys = ref<string[]>(['basic'])
const currentKey = ref<string>('basic')

const currentTitle = computed(() => {
  return t(currentKey.value === 'basic' ? 'settings.basic' : 'settings.security')
})

const handleMenuSelect = ({ key }: { key: string }) => {
  currentKey.value = key
}
</script>

<style lang="scss" scoped>
.settings-container {
  .settings-nav {
    :deep(.ant-card-body) {
      padding: 0;
    }

    :deep(.ant-menu) {
      border-right: none;
      border-radius: 8px;
      overflow: hidden;
    }

    :deep(.ant-menu-item) {
      border-radius: 6px;
      margin: 4px 8px;
      width: calc(100% - 16px);
    }

    :deep(.ant-menu-item-selected) {
      background-color: #e6f7ff;
      color: #1890ff;
      border-radius: 6px;
    }
  }

  .settings-content {
    min-height: 600px;
  }
}
</style>
