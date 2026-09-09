import request from '@/utils/request'

export interface AuthRole {
  rolId: string
  rolCd: string
  rolNm: string
}

export interface AuthUser {
  userId: string
  userNm: string
  realNm?: string
  rmk?: string
  tel?: string
  orgCd?: string
  roles: AuthRole[]
}

export interface AuthMenu {
  menuId: string
  menuNm: string
  path: string
  icon?: string
  isDsp?: number | string
  children?: AuthMenu[]
}

export interface AuthCode {
  permCd?: string
}

export interface AuthResources {
  menus: AuthMenu[]
  codes: AuthCode[]
}

export interface AuthLoginResponse {
  accessToken: string
  authUser: AuthUser
}

const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL || '/auth'

export const login = (data: { username: string; password: string }) =>
  request<AuthLoginResponse>({
    baseURL: authBaseUrl,
    url: '/system/login',
    method: 'post',
    data,
  })

export const getResources = () =>
  request<AuthResources>({
    baseURL: authBaseUrl,
    url: '/system/resources',
    method: 'get',
  })

export const logout = () =>
  request({
    baseURL: authBaseUrl,
    url: '/system/logout',
    method: 'post',
  })
