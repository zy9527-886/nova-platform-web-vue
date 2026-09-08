<template>
  <a-modal
    :open="open"
    :title="t('role.menuPermissions')"
    :confirm-loading="saving"
    destroy-on-close
    @cancel="emit('update:open', false)"
    @ok="handleSave"
  >
    <a-spin :spinning="loading">
      <a-alert
        v-if="record"
        type="info"
        show-icon
        :message="t('role.configuring', { name: record.rolNm })"
        class="role-alert"
      />
      <a-tree
        v-model:checked-keys="checkedKeys"
        checkable
        default-expand-all
        :field-names="{ title: 'menuNm', key: 'menuId', children: 'children' }"
        :tree-data="treeData"
      />
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

import { listMenus, type SysMenu } from '@/api/menu'
import { bindRoleMenus, getRoleMenuIds, type SysRole } from '@/api/system/role'
import { buildMenuTree } from '@/views/system/shared/data'

const { t } = useI18n()

const props = defineProps<{ open: boolean; record: SysRole | null }>()
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'success'): void
}>()

const loading = ref(false)
const saving = ref(false)
const treeData = ref<SysMenu[]>([])
const checkedKeys = ref<string[]>([])

watch(
  () => props.open,
  async open => {
    if (!open || !props.record) return
    loading.value = true
    try {
      const [menus, selected] = await Promise.all([listMenus(), getRoleMenuIds(props.record.rolId)])
      treeData.value = buildMenuTree(menus)
      checkedKeys.value = selected.data
    } catch (error: any) {
      message.error(error?.message || t('role.permissionsFailed'))
    } finally {
      loading.value = false
    }
  },
)

const handleSave = async () => {
  if (!props.record) return
  saving.value = true
  try {
    await bindRoleMenus(props.record.rolId, checkedKeys.value.map(String))
    message.success(t('role.permissionsSaved'))
    emit('success')
  } catch (error: any) {
    message.error(error?.message || t('role.savePermissionsFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.role-alert {
  margin-bottom: 16px;
}
</style>
