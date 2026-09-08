import request from '@/utils/request'
import { mockLogin, mockGetUserInfo } from './mock'

// 是否使用 Mock 数据（开发环境默认使用）
const USE_MOCK = import.meta.env.DEV
// 登录
export const login = (data: { username: string; password: string }) => {
  if (USE_MOCK) {
    return mockLogin(data.username, data.password) as Promise<any>
  }
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 获取用户信息
export const getUserInfo = () => {
  if (USE_MOCK) {
    return mockGetUserInfo() as Promise<any>
  }
  return request({
    url: '/user/info',
    method: 'get',
  })
}

// 登出
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request({
    url: '/user/change-password',
    method: 'post',
    data,
  })
}
