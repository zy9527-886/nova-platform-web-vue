import type { SysRole } from './role'
import { systemRequest, type PageData } from './types'

export interface SysUserRole {
  userId?: string
  rolId: string
}

export interface SysUser {
  userId: string
  userNm: string
  rmk?: string
  idTyp?: string
  idNo?: string
  realNm?: string
  tel?: string
  orgCd?: string
  stus: string
  icon?: string
  creTm?: string
  roles?: SysRole[]
}

export interface SysUserQuery {
  userNm?: string
  idNo?: string
  realNm?: string
  tel?: string
  stus?: string
  orgCd?: string
  userRolList?: SysUserRole[]
}

export type SysUserSave = Omit<SysUser, 'userId' | 'creTm' | 'roles'> & {
  userId?: string
  userRolList?: SysUserRole[]
}

export const pageUsers = (current: number, size: number, query: SysUserQuery = {}) =>
  systemRequest<PageData<SysUser>>({
    url: '/system/sysUser/page',
    method: 'post',
    data: { current, size, query },
  })

export const getUser = (userId: string) =>
  systemRequest<SysUser>({ url: `/system/sysUser/getById/${userId}`, method: 'get' })

export const saveUser = (data: SysUserSave) =>
  systemRequest<number>({ url: '/system/sysUser/saveOrUpdate', method: 'post', data })

export const removeUser = (userId: string) =>
  systemRequest<boolean>({ url: `/system/sysUser/removeById/${userId}`, method: 'delete' })

export const removeUsers = (userIds: string[]) =>
  systemRequest<boolean>({ url: '/system/sysUser/removeByIds', method: 'delete', data: userIds })
