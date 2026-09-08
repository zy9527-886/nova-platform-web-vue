// Mock API 数据（用于开发测试，实际项目中应该连接真实后端）

// 模拟登录
export const mockLogin = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-token-' + Date.now(),
          },
        })
      } else {
        reject({
          code: 401,
          message: '用户名或密码错误',
        })
      }
    }, 500)
  })
}

// 模拟获取用户信息
export const mockGetUserInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: '',
          roles: ['admin'],
          permissions: ['*'],
        },
      })
    }, 300)
  })
}
