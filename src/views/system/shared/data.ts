import type { SysMenu } from '@/api/menu'
import type { SysUserQuery, SysUserRole } from '@/api/system/user'

export const buildMenuTree = (rows: SysMenu[]): SysMenu[] => {
  const nodes = new Map<string, SysMenu>()
  rows.forEach((row) => nodes.set(row.menuId, { ...row, children: [] }))

  const roots: SysMenu[] = []
  nodes.forEach((node) => {
    const parent = nodes.get(node.prentId)
    if (node.prentId !== '0' && parent && parent.menuId !== node.menuId) {
      parent.children?.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (items: SysMenu[]) => {
    items.sort((left, right) => left.sort - right.sort || left.menuId.localeCompare(right.menuId))
    items.forEach((item) => item.children?.length && sortNodes(item.children))
  }
  sortNodes(roots)
  return roots
}

export const collectDescendantIds = (tree: SysMenu[], menuId: string): Set<string> => {
  const result = new Set<string>()
  const visit = (node: SysMenu): boolean => {
    if (node.menuId === menuId) {
      const collect = (item: SysMenu) => {
        result.add(item.menuId)
        item.children?.forEach(collect)
      }
      collect(node)
      return true
    }
    return node.children?.some(visit) ?? false
  }
  tree.some(visit)
  return result
}

export const pageAfterDelete = (current: number, currentRowCount: number, deletedCount: number) =>
  current > 1 && currentRowCount <= deletedCount ? current - 1 : current

export const toUserRoleList = (roleIds: string[]): SysUserRole[] =>
  [...new Set(roleIds.filter(Boolean))].map((rolId) => ({ rolId }))

export interface UserSearchFilters {
  userNm: string
  idNo: string
  realNm: string
  tel: string
  stus?: string
  roleId?: string
}

export const buildUserQuery = (filters: UserSearchFilters): SysUserQuery => ({
  userNm: filters.userNm || undefined,
  idNo: filters.idNo || undefined,
  realNm: filters.realNm || undefined,
  tel: filters.tel || undefined,
  stus: filters.stus,
  userRolList: filters.roleId ? toUserRoleList([filters.roleId]) : undefined,
})
