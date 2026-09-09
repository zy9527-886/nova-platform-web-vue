<template>
  <a-menu
    v-model:selected-keys="selectedKeys"
    v-model:open-keys="openKeys"
    mode="inline"
    :theme="menuTheme"
    :inline-collapsed="collapsed"
    :selectable="true"
    :trigger-sub-menu-action="'hover'"
    @click="handleMenuClick"
  >
      <template v-for="item in menuRoutes" :key="item.menuId">
        <template v-if="shouldShowRoute(item)">
          <a-sub-menu v-if="hasChildren(item)" :key="item.path">
          <template #icon>
            <component :is="getIcon(item.icon)" v-if="item.icon" />
          </template>
          <template #title>{{ routeTitle(item) }}</template>
          <template v-for="child in getValidChildren(item)" :key="child.menuId">
            <a-menu-item v-if="shouldShowRoute(child)" :key="child.path">
              <template #icon>
                <component :is="getIcon(child.icon)" v-if="child.icon" />
              </template>
              <span>{{ routeTitle(child) }}</span>
            </a-menu-item>
          </template>
        </a-sub-menu>
        <a-menu-item v-else :key="item.path">
          <template #icon>
            <component :is="getIcon(item.icon)" v-if="item.icon" />
          </template>
          {{ routeTitle(item) }}
        </a-menu-item>
      </template>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as Icons from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const currentRoute = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const { t } = useI18n()

interface AppMenu {
  menuId: string
  menuNm: string
  path: string
  icon?: string
  isDsp?: number | string
  children?: AppMenu[]
}

const collapsed = computed(() => appStore.collapsed)
const menuTheme = computed(() => (appStore.theme === 'light' ? 'light' : 'dark'))

const menuRoutes = computed<AppMenu[]>(() => userStore.menus)

const shouldShowRoute = (menu: AppMenu) => menu.isDsp !== 0 && menu.isDsp !== '0'

const hasChildren = (menu: AppMenu) => !!menu.children?.length

const getValidChildren = (menu: AppMenu) => menu.children?.filter(shouldShowRoute) ?? []

const selectedKeys = ref<string[]>([currentRoute.path])
const openKeys = ref<string[]>([])

const getParentOpenKey = (): string[] => {
  const parent = menuRoutes.value.find(menu =>
    menu.children?.some(child => child.path === currentRoute.path),
  )
  return parent ? [parent.path] : []
}

// 监听路由变化
watch(
  () => currentRoute.path,
  (newPath) => {
    selectedKeys.value = [newPath]
    // 设置父级菜单展开（收缩状态下不展开）
    openKeys.value = collapsed.value ? [] : getParentOpenKey()
  },
  { immediate: true },
)

// 监听收缩状态变化
watch(
  () => collapsed.value,
  (isCollapsed) => {
    openKeys.value = isCollapsed ? [] : getParentOpenKey()
  },
)

// 获取图标组件
const iconsMap = Icons as Record<string, Component>

const getIcon = (iconName?: unknown): Component | null => {
  if (typeof iconName !== 'string' || !iconName) return null
  return iconsMap[iconName] || null
}

const routeTitle = (menu: AppMenu) => menu.menuNm || t('common.noData')

// 菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  router.push(key)
}
</script>

<style lang="scss" scoped>
:deep(.ant-menu) {
  border-right: none;

  // 防止父菜单被选中时高亮
  .ant-menu-submenu-selected {
    > .ant-menu-submenu-title {
      color: rgba(255, 255, 255, 0.65) !important;
      background: transparent !important;
    }
  }

  // 确保只有子菜单项被选中时高亮
  .ant-menu-item-selected {
    background-color: var(--app-primary-color) !important;
    color: #fff !important;
  }

  // 父菜单标题不应该有选中背景
  .ant-menu-submenu-title {
    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  // 收缩状态下的样式
  &.ant-menu-inline-collapsed {
    width: 64px;

    .ant-menu-item,
    .ant-menu-submenu-title {
      padding: 0 16px !important;
      text-align: center;
    }

    .ant-menu-item-icon,
    .ant-menu-submenu-title .anticon {
      margin-right: 0 !important;
    }
  }
}
</style>

