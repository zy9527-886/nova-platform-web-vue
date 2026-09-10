import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permission'

export const usePermission = () => {
  const userStore = useUserStore()
  return { hasPermission: (code: string) => hasPermission(userStore.resources, code) }
}
