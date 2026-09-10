import { Storage } from './storage'
import type { AuthUser } from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const AUTH_RESOURCES_KEY = 'authResources'

export const getToken = (): string | null => {
  return Storage.get<string>(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  Storage.set(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  Storage.remove(TOKEN_KEY)
}

export const getUserInfo = (): AuthUser | null => {
  return Storage.get<AuthUser>(USER_INFO_KEY)
}

export const setUserInfo = (userInfo: AuthUser): void => {
  Storage.set(USER_INFO_KEY, userInfo)
}

export const removeUserInfo = (): void => {
  Storage.remove(USER_INFO_KEY)
}

export const getAuthResources = () => Storage.get(AUTH_RESOURCES_KEY)

export const setAuthResources = (resources: unknown): void => {
  Storage.set(AUTH_RESOURCES_KEY, resources)
}

export const removeAuthResources = (): void => {
  Storage.remove(AUTH_RESOURCES_KEY)
}

