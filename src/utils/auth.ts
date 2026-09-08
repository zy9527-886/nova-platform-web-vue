import { Storage } from './storage'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

export const getToken = (): string | null => {
  return Storage.get<string>(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  Storage.set(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  Storage.remove(TOKEN_KEY)
}

export const getUserInfo = () => {
  return Storage.get(USER_INFO_KEY)
}

export const setUserInfo = (userInfo: any): void => {
  Storage.set(USER_INFO_KEY, userInfo)
}

export const removeUserInfo = (): void => {
  Storage.remove(USER_INFO_KEY)
}

