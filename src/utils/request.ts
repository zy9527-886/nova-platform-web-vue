import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'

NProgress.configure({ showSpinner: false })

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start()
    const userStore = useUserStore()
    if (userStore.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error: any) => {
    NProgress.done()
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()
    const res = response.data

    // 如果返回的状态码不是200，则视为错误
    if (res.code !== 200 && res.code !== 0) {
      const responseMessage = res.msg || res.message || res.errorMsg || '请求失败'
      message.error(responseMessage)
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
      }
      
      return Promise.reject(new Error(responseMessage))
    } else {
      return res
    }
  },
  (error: any) => {
    NProgress.done()
    let errorMessage = '请求失败'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '未授权，请重新登录'
          const userStore = useUserStore()
          userStore.logout()
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求错误，未找到该资源'
          break
        case 500:
          errorMessage = '服务器错误'
          break
        default:
          errorMessage = `连接错误${error.response.status}`
      }
    } else {
      errorMessage = '网络连接异常'
    }
    
    message.error(errorMessage)
    return Promise.reject(error)
  }
)

export default service

