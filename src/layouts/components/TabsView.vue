<template>
  <div ref="tabsViewRef" class="tabs-view">
    <a-tabs
      v-model:active-key="activeKey"
      type="editable-card"
      hide-add
      size="small"
      @edit="handleEdit"
      @change="handleChange"
    >
      <a-tab-pane v-for="tab in tabsList" :key="tab.path" :closable="tab.closable">
        <template #tab>
          <span class="tab-label">
            <span>{{ getTabTitle(tab) }}</span>
            <ReloadOutlined
              v-if="tab.path === activeKey"
              :class="['tab-refresh-icon', { 'is-rotating': refreshingPath === tab.path }]"
              @click.stop="handleRefresh(tab.path)"
            />
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>
    <a-dropdown v-model:open="dropdownOpen" :trigger="['click']" :overlay-style="{ zIndex: 1050 }">
      <div
        ref="dropdownTriggerRef"
        :style="{
          position: 'fixed',
          left: contextMenuPosition.x + 'px',
          top: contextMenuPosition.y + 'px',
          width: '1px',
          height: '1px',
          pointerEvents: 'none',
          opacity: 0,
        }"
      ></div>
      <template #overlay>
        <a-menu @click="handleMenuClick($event, contextMenuTabPath)">
          <a-menu-item key="closeOthers" :disabled="tabsList.length <= 1">{{ t('layout.closeOthers') }}</a-menu-item>
          <a-menu-item key="closeLeft" :disabled="isFirstTab(contextMenuTabPath) || tabsList.length <= 1">
            {{ t('layout.closeLeft') }}
          </a-menu-item>
          <a-menu-item key="closeRight" :disabled="isLastTab(contextMenuTabPath) || tabsList.length <= 1">
            {{ t('layout.closeRight') }}
          </a-menu-item>
          <a-menu-item key="refresh">{{ t('common.refresh') }}</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const tabsList = computed(() => appStore.tabsList)
const activeKey = ref(route.path)
const tabsViewRef = ref<HTMLElement | null>(null)
const dropdownTriggerRef = ref<HTMLElement | null>(null)
const dropdownOpen = ref(false)
const contextMenuTabPath = ref('')
const contextMenuPosition = ref({ x: 0, y: 0 })
const refreshingPath = ref('')

const getTabTitle = (tab: { title?: string; titleKey?: string }) => tab.titleKey ? t(tab.titleKey) : tab.title || ''

watch(
  () => route.path,
  newPath => {
    activeKey.value = newPath
  },
)

// 处理右键菜单
const handleContextMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const tabElement = target.closest('.ant-tabs-tab')
  if (!tabElement) {
    dropdownOpen.value = false
    return
  }

  e.preventDefault()
  e.stopPropagation()

  // 找到对应的 tab path - 通过 data 属性或文本内容
  const renderedTitle = tabElement.querySelector('.ant-tabs-tab-btn')?.textContent?.trim()
  const tab = tabsList.value.find(tab => getTabTitle(tab) === renderedTitle)
  if (!tab) {
    dropdownOpen.value = false
    return
  }

  contextMenuTabPath.value = tab.path
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }

  // 使用 nextTick 确保 trigger 元素已更新位置
  nextTick(() => {
    if (dropdownTriggerRef.value) {
      dropdownTriggerRef.value.style.left = `${e.clientX}px`
      dropdownTriggerRef.value.style.top = `${e.clientY}px`
    }
    dropdownOpen.value = true
  })
}

// 点击外部关闭菜单
const handleClickOutside = () => {
  if (dropdownOpen.value) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  if (tabsViewRef.value) {
    tabsViewRef.value.addEventListener('contextmenu', handleContextMenu)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (tabsViewRef.value) {
    tabsViewRef.value.removeEventListener('contextmenu', handleContextMenu)
  }
  document.removeEventListener('click', handleClickOutside)
})

// 刷新标签页
const handleRefresh = (path: string) => {
  refreshingPath.value = path

  appStore.triggerRefresh(path)
  if (path !== route.path) {
    router.push(path)
  }

  window.setTimeout(() => {
    if (refreshingPath.value === path) {
      refreshingPath.value = ''
    }
  }, 600)
}

// 标签页切换
const handleChange = (key: string) => {
  router.push(key)
}

// 关闭标签页
const handleEdit = (targetKey: string, action: string) => {
  if (action === 'remove') {
    const index = tabsList.value.findIndex(tab => tab.path === targetKey)
    if (index > -1) {
      // 如果关闭的是当前页，跳转到前一个或首页
      if (targetKey === route.path) {
        if (index > 0) {
          router.push(tabsList.value[index - 1].path)
        } else if (tabsList.value.length > 1) {
          router.push(tabsList.value[1].path)
        } else {
          router.push('/dashboard')
        }
      }
      appStore.removeTab(targetKey)
    }
  }
}

// 判断是否是第一个标签页
const isFirstTab = (path: string) => {
  return tabsList.value[0]?.path === path
}

// 判断是否是最后一个标签页
const isLastTab = (path: string) => {
  return tabsList.value[tabsList.value.length - 1]?.path === path
}

// 处理右键菜单点击
const handleMenuClick = (e: { key: string }, targetPath: string) => {
  dropdownOpen.value = false
  const index = tabsList.value.findIndex(tab => tab.path === targetPath)
  const currentIndex = tabsList.value.findIndex(tab => tab.path === route.path)

  switch (e.key) {
    case 'closeOthers':
      // 关闭其他标签页
      appStore.closeOtherTabs(targetPath)
      // 如果当前页不是目标页，跳转到目标页
      if (route.path !== targetPath) {
        router.push(targetPath)
      }
      break
    case 'closeLeft':
      // 关闭左侧标签页
      appStore.closeLeftTabs(targetPath)
      // 如果当前页在关闭范围内，跳转到目标页
      if (currentIndex < index) {
        router.push(targetPath)
      }
      break
    case 'closeRight':
      // 关闭右侧标签页
      appStore.closeRightTabs(targetPath)
      // 如果当前页在关闭范围内，跳转到目标页
      if (currentIndex > index) {
        router.push(targetPath)
      }
      break
    case 'refresh':
      // 刷新当前页
      handleRefresh(targetPath)
      break
  }
}
</script>

<style lang="scss" scoped>
.tabs-view {
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;

  :deep(.ant-tabs-tab .ant-tabs-tab-remove) {
    margin-inline-start: 0 !important;
    margin-left: 5px !important;
  }

  :deep(.ant-tabs) {
    .ant-tabs-nav {
      margin: 5px 0 0;
    }

    .ant-tabs-tab {
      padding: 8px 16px;
      margin: 0 4px 0 0;

      .tab-label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .tab-refresh-icon {
        font-size: 12px;
        margin-right: 5px;
        margin-left: 5px;
        color: rgba(0, 0, 0, 0.45);
        transition: color 0.2s;

        &.is-rotating {
          animation: tab-refresh-spin 0.6s linear;
        }

        &:hover {
          color: #1677ff;
        }
      }
    }
  }
}

:global(body.theme-dark .tabs-view) {
  background: #1f1f1f;
  border-bottom-color: #303030;
}

@keyframes tab-refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
