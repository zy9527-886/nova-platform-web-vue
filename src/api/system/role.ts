import { systemRequest, type PageData } from './types'

export interface SysRole {
  rolId: string
  rolNm: string
  rolCd?: string
  rolLv?: string
  rolDesc?: string
  orgId: string
  isPub: number
  crePer?: string
  creTm?: string
  updtPer?: string
  updtTm?: string
}

export type SysRoleSave = Omit<SysRole, 'rolId' | 'creTm' | 'updtTm'> & { rolId?: string }

export const pageRoles = (pageNumber: number, pageSize: number) =>
  systemRequest<PageData<SysRole>>({
    url: '/system/sysRol/page',
    method: 'post',
    data: { pageNumber, pageSize },
  })

export const listRoles = async () =>
  (await systemRequest<SysRole[]>({ url: '/system/sysRol/list', method: 'get' })).data

export const getRole = (rolId: string) =>
  systemRequest<SysRole>({ url: `/system/sysRol/getById/${rolId}`, method: 'get' })

export const saveRole = (data: SysRoleSave) =>
  systemRequest<boolean>({ url: '/system/sysRol/saveOrUpdate', method: 'post', data })

export const removeRole = (rolId: string) =>
  systemRequest<boolean>({ url: `/system/sysRol/removeById/${rolId}`, method: 'delete' })

export const removeRoles = (rolIds: string[]) =>
  systemRequest<boolean>({ url: '/system/sysRol/removeByIds', method: 'delete', data: rolIds })

export const getRoleMenuIds = (rolId: string) =>
  systemRequest<string[]>({ url: `/system/sysRol/menuIds/${rolId}`, method: 'get' })

export const bindRoleMenus = (rolId: string, menuIds: string[]) =>
  systemRequest<boolean>({
    url: '/system/sysRol/bindMenus',
    method: 'post',
    data: { rolId, menuIds },
  })
