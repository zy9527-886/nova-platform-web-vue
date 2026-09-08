import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo as getUserInfoApi } from '@/api/user'
import { setToken, removeToken, setUserInfo, removeUserInfo, getToken, getUserInfo } from '@/utils/auth'
import { useRouter } from 'vue-router'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  email?: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(null)
  const router = useRouter()

  // 登录
  const loginAction = async (username: string, password: string) => {
    try {
      const res = await login({ username, password })
      if (res.data?.token) {
        token.value = res.data.token
        setToken(res.data.token)
        
        // 获取用户信息
        await getUserInfoAction()
        
        return Promise.resolve(res)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  const getUserInfoAction = async () => {
    try {
      const res = await getUserInfoApi()
      if (res.data) {
        userInfo.value = res.data
        setUserInfo(res.data)
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUserInfo()
    router.push('/login')
  }

  // 初始化用户信息
  const initUserInfo = () => {
    if (token.value) {
      const info = getUserInfo()
      if (info) {
        userInfo.value = info
      } else {
        getUserInfoAction()
      }
    }
  }

  return {
    token,
    userInfo,
    loginAction,
    getUserInfoAction,
    logout,
    initUserInfo,
  }
})

