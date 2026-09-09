import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getResources, login, logout as logoutApi, type AuthMenu, type AuthResources, type AuthUser } from '@/api/auth'
import { encryptLoginPassword } from '@/utils/crypto'
import {
  getAuthResources,
  getToken,
  getUserInfo,
  removeAuthResources,
  removeToken,
  removeUserInfo,
  setAuthResources,
  setToken,
  setUserInfo,
} from '@/utils/auth'
import { useRouter } from 'vue-router'

export interface UserInfo {
  id: string
  username: string
  nickname: string
  email?: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

const toUserInfo = (authUser: AuthUser, permissions: string[] = []): UserInfo => ({
  id: authUser.userId,
  username: authUser.userNm,
  nickname: authUser.realNm || authUser.rmk || authUser.userNm,
  roles: authUser.roles.map(role => role.rolCd || role.rolId),
  permissions,
})

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(getUserInfo() as UserInfo | null)
  const resources = ref<AuthResources | null>(getAuthResources() as AuthResources | null)
  const menus = ref<AuthMenu[]>(resources.value?.menus ?? [])
  const router = useRouter()

  const loginAction = async (username: string, password: string) => {
    const res = await login({ username, password: encryptLoginPassword(password) })
    const loginData = res.data
    token.value = loginData.accessToken
    setToken(loginData.accessToken)
    userInfo.value = toUserInfo(loginData.authUser)
    setUserInfo(userInfo.value)
    await getResourcesAction()
    return res
  }

  const getResourcesAction = async () => {
    const res = await getResources()
    resources.value = res.data
    menus.value = res.data.menus ?? []
    setAuthResources(res.data)
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, permissions: (res.data.codes ?? []).flatMap(code => code.permCd ? [code.permCd] : []) }
      setUserInfo(userInfo.value)
    }
    return res.data
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    resources.value = null
    menus.value = []
    removeToken()
    removeUserInfo()
    removeAuthResources()
    router.push('/login')
  }

  const logoutAction = async () => {
    try {
      if (token.value) await logoutApi()
    } finally {
      logout()
    }
  }

  const initUserInfo = () => {
    if (token.value) {
      userInfo.value = getUserInfo() as UserInfo | null
      resources.value = getAuthResources() as AuthResources | null
      menus.value = resources.value?.menus ?? []
      if (!resources.value) void getResourcesAction()
    }
  }

  return {
    token,
    userInfo,
    resources,
    menus,
    loginAction,
    getResourcesAction,
    logout,
    logoutAction,
    initUserInfo,
  }
})

