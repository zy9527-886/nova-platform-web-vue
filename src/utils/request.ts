import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import { i18n } from '@/locales'

const t = i18n.global.t

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
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()
    const res = response.data

    // 如果返回的状态码不是200，则视为错误
    if (res.code !== 200 && res.code !== 0) {
      const responseMessage = res.msg || res.message || res.errorMsg || t('common.requestFailed')
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
    let errorMessage = t('common.requestFailed')

    if (error.response) {
      switch (error.response.status) {
        case 401: {
          errorMessage = t('common.unauthorized')
          const userStore = useUserStore()
          userStore.logout()
          break
        }
        case 403:
          errorMessage = t('common.forbidden')
          break
        case 404:
          errorMessage = t('common.notFound')
          break
        case 500:
          errorMessage = t('common.serverError')
          break
        default:
          errorMessage = t('common.connectionError', { status: error.response.status })
      }
    } else {
      errorMessage = t('common.networkError')
    }

    message.error(errorMessage)
    return Promise.reject(error)
  },
)

export default service
