import type { AxiosRequestConfig } from 'axios'

import request from '@/utils/request'

export interface ApiResponse<T> {
  suc: boolean
  code: number
  msg: string
  errorMsg?: string | null
  data: T
}

export interface PageData<T> {
  records: T[]
  pageNumber: number
  pageSize: number
  totalPage: number
  totalRow: number
}

export const systemRequest = <T>(config: AxiosRequestConfig) =>
  request(config) as unknown as Promise<ApiResponse<T>>

