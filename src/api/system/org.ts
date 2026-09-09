import { systemRequest, type PageData } from './types'

export interface SysOrg {
  orgId: string
  orgCd: string
  orgNm: string
  orgPrentId: string
  orgLvCd: string
  orgAddr?: string
  telNo?: string
  ctctPer?: string
  orgStus: string
  orgDesc?: string
  rmk?: string
  creTm?: string
}

export interface SysOrgTree extends Pick<SysOrg, 'orgId' | 'orgCd' | 'orgNm' | 'orgPrentId' | 'orgStus'> {
  children: SysOrgTree[]
}

export interface SysOrgQuery {
  orgCd?: string
  orgNm?: string
  orgStus?: string
  treeOrgCd?: string
}

export type SysOrgSave = Partial<SysOrg> & Pick<SysOrg, 'orgNm' | 'orgPrentId' | 'orgStus'>

export const pageOrganizations = (current: number, size: number, query: SysOrgQuery = {}) =>
  systemRequest<PageData<SysOrg>>({
    url: '/system/sysOrg/page',
    method: 'post',
    data: { current, size, query },
  })

export const getOrganizationTree = () =>
  systemRequest<SysOrgTree[]>({ url: '/system/sysOrg/tree', method: 'get' })

export const getOrganization = (orgId: string) =>
  systemRequest<SysOrg>({ url: `/system/sysOrg/getById/${orgId}`, method: 'get' })

export const saveOrganization = (data: SysOrgSave) =>
  systemRequest<boolean>({ url: '/system/sysOrg/saveOrUpdate', method: 'post', data })

export const removeOrganization = (orgId: string) =>
  systemRequest<boolean>({ url: `/system/sysOrg/removeById/${orgId}`, method: 'delete' })

export const removeOrganizations = (orgIds: string[]) =>
  systemRequest<boolean>({ url: '/system/sysOrg/removeByIds', method: 'delete', data: orgIds })
