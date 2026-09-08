<template>
  <a-layout class="basic-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="208"
      :collapsed-width="64"
      class="layout-sider"
      :theme="siderTheme"
    >
      <div class="logo">
        <div class="logo-content">
          <img src="@/assets/images/logo.png" alt="Logo" class="logo-img" />
          <h2 v-if="!collapsed" class="logo-text">Admin Pro</h2>
        </div>
      </div>
      <Menu />
      <div class="sider-footer">
        <div class="collapse-btn" @click="toggleCollapsed">
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </div>
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <div class="header-left">
          <div class="trigger-wrapper" @click="toggleCollapsed">
            <menu-unfold-outlined v-if="collapsed" class="trigger" />
            <menu-fold-outlined v-else class="trigger" />
          </div>
          <Breadcrumb />
        </div>
        <div class="header-right">
          <a-space :size="8">
            <!-- 设置 -->
            <a-tooltip :title="t('layout.styleSettings')">
              <div class="header-action" @click="showThemeDrawer">
                <SettingOutlined />
              </div>
            </a-tooltip>

            <!-- 全屏 -->
            <a-tooltip :title="isFullscreen ? t('layout.exitFullscreen') : t('layout.fullscreen')">
              <div class="header-action" @click="toggleFullscreen">
                <FullscreenOutlined v-if="!isFullscreen" />
                <FullscreenExitOutlined v-else />
              </div>
            </a-tooltip>

            <!-- 用户信息 -->
            <a-dropdown>
              <div class="user-info">
                <a-avatar :size="32" :src="userInfo?.avatar" class="user-avatar">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <span class="username">{{
                  userInfo?.nickname || userInfo?.username || t('layout.administrator')
                }}</span>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="settings" @click="handleSettings">
                    <SettingOutlined />
                    <span>{{ t('layout.personalSettings') }}</span>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout" @click="handleLogout">
                    <LogoutOutlined />
                    <span>{{ t('layout.logout') }}</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <a-layout-content class="layout-content">
        <TabsView v-if="tabsList.length > 0" />
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="viewKey" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>

      <a-layout-footer class="layout-footer">
        <span>© {{ currentYear }} Ant Admin · Powered by Vue 3 + Ant Design Vue</span>
      </a-layout-footer>
    </a-layout>

    <!-- 主题配置抽屉 -->
    <ThemeDrawer v-model:open="themeDrawerVisible" />
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import Menu from './components/Menu.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import TabsView from './components/TabsView.vue'
import ThemeDrawer from './components/ThemeDrawer.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

const siderTheme = computed(() => (appStore.theme === 'light' ? 'light' : 'dark'))

const collapsed = computed({
  get: () => appStore.collapsed,
  set: val => appStore.setCollapsed(val),
})

const tabsList = computed(() => appStore.tabsList)
const userInfo = computed(() => userStore.userInfo)
const isFullscreen = ref(false)
const themeDrawerVisible = ref(false)
const currentYear = new Date().getFullYear()

const viewKey = computed(() => {
  const currentPath = router.currentRoute.value.path
  if (appStore.refreshPath === currentPath) {
    return `${currentPath}?refresh=${appStore.refreshStamp}`
  }
  return currentPath
})

const toggleCollapsed = () => {
  appStore.toggleCollapsed()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  // 初始化主题
  appStore.setTheme(appStore.theme)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

const handleSettings = () => {
  router.push('/settings')
}

const handleLogout = () => {
  userStore.logout()
}

const showThemeDrawer = () => {
  themeDrawerVisible.value = true
}
</script>

<style lang="scss" scoped>
.basic-layout {
  height: 100vh;
  overflow: hidden;

  .layout-sider {
    overflow: hidden;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;

    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      background: #001529;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .logo-content {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0 16px;

        .logo-img {
          width: 32px;
          height: 32px;
          margin-right: 12px;
          object-fit: contain;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin: 0;
          white-space: nowrap;
        }
      }
    }

    // 菜单容器
    :deep(.ant-menu) {
      border-right: none;
      background: #001529;
    }

    // 菜单根容器 - 设置最大高度和滚动（需要减去底部按钮高度）
    :deep(.ant-menu-root) {
      max-height: calc(100vh - 64px - 48px);
      overflow-y: auto;
      overflow-x: hidden;

      // 滚动条样式
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        transition: background 0.3s;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    // 底部折叠按钮
    .sider-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: #001529;

      .collapse-btn {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 16px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.65);
        font-size: 16px;
        transition: all 0.3s;

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }

  .layout-header {
    background: #fff;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    margin-left: 208px;
    transition: margin-left 0.2s;
    z-index: 99;
    position: relative;

    .header-left {
      display: flex;
      align-items: center;
      flex: 1;

      .trigger-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        margin-right: 16px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background: #f5f5f5;
        }

        .trigger {
          font-size: 18px;
          color: #595959;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;

      .header-action {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        color: #595959;
        font-size: 18px;

        &:hover {
          background: #f5f5f5;
          color: #1890ff;
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        margin-left: 0;

        &:hover {
          background: #f5f5f5;
        }

        .user-avatar {
          margin-right: 6px;
        }

        .username {
          font-size: 14px;
          color: #262626;
        }
      }
    }

    // 下拉菜单样式调整
    :deep(.ant-dropdown-menu) {
      .ant-dropdown-menu-item {
        .anticon {
          margin-right: 12px !important;
        }
      }
    }
  }

  .layout-content {
    margin-left: 208px;
    transition: margin-left 0.2s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #f0f2f5;

    .content-wrapper {
      flex: 1;
      padding: 24px;
      overflow: auto;
    }
  }

  .layout-footer {
    margin-left: 208px;
    padding: 10px 24px;
    text-align: center;
    color: #8c8c8c;
    font-size: 13px;
    background: #f0f2f5;
    border-top: 1px solid #e8e8e8;
    transition: margin-left 0.2s;
  }
}

// 全局下拉菜单样式
:deep(.ant-dropdown-menu-item) {
  .anticon {
    margin-right: 12px !important;
  }
}

.basic-layout :deep(.ant-layout-sider-collapsed) {
  & ~ .ant-layout {
    .layout-header,
    .layout-content,
    .layout-footer {
      margin-left: 64px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
