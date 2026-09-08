import { systemRequest } from './system/types'

export interface SysMenu {
  menuId: string
  menuNm: string
  permCd?: string
  path?: string
  prentId: string
  sort: number
  icon?: string
  typ: '0' | '1'
  isDsp: number
  menuSource?: string
  creTm?: string
  children?: SysMenu[]
}

export type SysMenuSave = Omit<SysMenu, 'menuId' | 'creTm' | 'children'> & { menuId?: string }

export const listMenus = async () =>
  (await systemRequest<SysMenu[]>({ url: '/system/sysMenu/list', method: 'get' })).data

export const getMenu = (menuId: string) =>
  systemRequest<SysMenu>({ url: `/system/sysMenu/getById/${menuId}`, method: 'get' })

export const saveMenu = (data: SysMenuSave) =>
  systemRequest<boolean>({ url: '/system/sysMenu/saveOrUpdate', method: 'post', data })

export const removeMenu = (menuId: string) =>
  systemRequest<boolean>({ url: `/system/sysMenu/removeById/${menuId}`, method: 'delete' })
