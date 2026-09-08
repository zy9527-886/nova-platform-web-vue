import request from '@/utils/request'
// 登录
export const login = (data: { username: string; password: string }) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 获取用户信息
export const getUserInfo = () => {
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
