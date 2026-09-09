import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
// @ts-ignore
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

// 静态路由
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      titleKey: 'route.login',
      hidden: true,
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    meta: {
      title: '首页',
      titleKey: 'route.home',
      hidden: false,
      icon: 'HomeOutlined',
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '工作台',
          titleKey: 'route.dashboard',
          icon: 'DashboardOutlined',
        },
      },
    ],
  },
  {
    path: '/system',
    component: () => import('@/layouts/BasicLayout.vue'),
    meta: {
      title: '系统管理',
      titleKey: 'route.system',
      icon: 'SettingOutlined',
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          titleKey: 'route.user',
          icon: 'UserOutlined',
        },
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          titleKey: 'route.role',
          icon: 'TeamOutlined',
        },
      },
      {
        path: 'org',
        name: 'Organization',
        component: () => import('@/views/system/org/index.vue'),
        meta: {
          title: '组织机构管理',
          titleKey: 'route.org',
          icon: 'ApartmentOutlined',
        },
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          titleKey: 'route.menu',
          icon: 'MenuOutlined',
        },
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('@/layouts/BasicLayout.vue'),
    meta: {
      title: '个人设置',
      titleKey: 'route.settings',
      icon: 'UserOutlined',
      hidden: true,
    },
    children: [
      {
        path: '',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: '个人设置',
          titleKey: 'route.settings',
        },
      },
    ],
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: () => import('@/layouts/BasicLayout.vue'),
    meta: {
      title: '重定向',
      titleKey: 'route.redirect',
      hidden: true,
    },
    children: [
      {
        path: ':path(.*)',
        name: 'RedirectPath',
        component: {
          beforeRouteEnter(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
            const { path } = to.params
            next((vm: { $router: { replace: (path: string) => void } }) => {
              vm.$router.replace(decodeURIComponent(path as string))
            })
          },
          render: () => null,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404',
      titleKey: 'route.notFound',
      hidden: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const appStore = useAppStore()

  // 如果已登录，初始化用户信息
  if (userStore.token && !userStore.userInfo) {
    userStore.initUserInfo()
  }

  // 白名单页面，直接放行
  if (to.path === '/login') {
    if (userStore.token) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 需要登录的页面
  if (!userStore.token) {
    next('/login')
    return
  }

  // 添加标签页
  if (to.meta.title && to.path !== '/') {
    appStore.addTab({
      path: to.path,
      title: to.meta.title as string,
      titleKey: to.meta.titleKey as string | undefined,
      closable: to.path !== '/dashboard',
    })
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router

