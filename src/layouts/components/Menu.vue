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
    <template v-for="item in menuRoutes" :key="item.path">
      <template v-if="shouldShowRoute(item)">
        <a-sub-menu v-if="hasChildren(item)" :key="item.path">
          <template #icon>
            <component :is="getIcon(item.meta?.icon)" v-if="item.meta?.icon" />
          </template>
          <template #title>{{ item.meta?.title || item.name }}</template>
          <template v-for="child in getValidChildren(item)" :key="child.fullPath || child.path">
            <a-menu-item v-if="shouldShowRoute(child)" :key="child.fullPath || child.path">
              <template #icon>
                <component :is="getIcon(child.meta?.icon)" v-if="child.meta?.icon" />
              </template>
              <span>{{ child.meta?.title || child.name }}</span>
            </a-menu-item>
          </template>
        </a-sub-menu>
        <a-menu-item v-else :key="item.path">
          <template #icon>
            <component :is="getIcon(item.meta?.icon)" v-if="item.meta?.icon" />
          </template>
          {{ item.meta?.title || item.name }}
        </a-menu-item>
      </template>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import {
  useRoute,
  useRouter,
  type RouteRecordNormalized,
  type RouteLocationMatched,
} from 'vue-router'
import * as Icons from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'

const currentRoute = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 扩展一 个 fullPath 字段，方便菜单使用
interface AppRoute extends RouteRecordNormalized {
  fullPath?: string
}

const collapsed = computed(() => appStore.collapsed)
const menuTheme = computed(() => (appStore.theme === 'light' ? 'light' : 'dark'))

// 获取路由列表（过滤掉登录和404页面）
const menuRoutes = computed<AppRoute[]>(() => {
  return router.getRoutes().filter((r) => {
    // 过滤掉登录页、404页
    if (r.path === '/login' || r.path === '/:pathMatch(.*)*') return false
    // 只显示有 children 且有 meta 的路由（布局路由）
    return !!r.meta && !!r.children && r.children.length > 0
  })
})

// 判断路由是否应该显示
const shouldShowRoute = (r: AppRoute): boolean => {
  if (!r.meta) return true
  return !r.meta.hidden
}

// 判断路由是否有有效的子路由
const hasChildren = (r: AppRoute): boolean => {
  return !!r.children && r.children.length > 0
}

// 获取有效的子路由
const getValidChildren = (r: AppRoute): AppRoute[] => {
  if (!r.children) return []
  return r.children
    .filter((child) => !child.redirect)
    .map((child) => {
      // 确保子路由有完整路径
      if (child.path && !child.path.startsWith('/')) {
        ;(child as AppRoute).fullPath = r.path === '/' ? `/${child.path}` : `${r.path}/${child.path}`
      } else {
        ;(child as AppRoute).fullPath = child.path
      }
      return child as AppRoute
    })
}

const selectedKeys = ref<string[]>([currentRoute.path])
const openKeys = ref<string[]>([])

// 根据当前路由计算需要展开的父级菜单 key
const getParentOpenKey = (): string[] => {
  const matched = currentRoute.matched as RouteLocationMatched[]
  if (matched.length > 1) {
    const parentRoute = matched.find((m) => m.children && m.children.length > 0)
    if (parentRoute) {
      return [parentRoute.path]
    }
  }
  return []
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
    background-color: #1890ff !important;
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

