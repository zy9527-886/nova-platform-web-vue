export interface PermissionResources {
  codes?: { permCd?: string }[]
}

export const hasPermission = (resources: PermissionResources | null | undefined, code: string) =>
  Boolean(code) && (resources?.codes ?? []).some(resource => resource.permCd === code)
