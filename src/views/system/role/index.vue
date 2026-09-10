<template>
  <a-card :bordered="false">
    <div class="table-toolbar">
      <a-space>
        <a-tooltip :title="t('role.addRole')">
          <a-button v-if="hasPermission('system:role:save')" :aria-label="t('role.addRole')" @click="handleAdd">
            <PlusCircleTwoTone two-tone-color="#52c41a" />
          </a-button>
        </a-tooltip>
        <a-tooltip :title="t('common.batchDelete')">
          <a-button
            v-if="hasPermission('system:role:deleteBatch')"
            :disabled="!selectedRowKeys.length"
            :aria-label="t('common.batchDelete')"
            @click="handleBatchDelete"
          >
            <MinusCircleTwoTone two-tone-color="#ff4d4f" />
          </a-button>
        </a-tooltip>
      </a-space>
      <TableColumnSetting
        v-model:visible-keys="visibleColumnKeys"
        :columns="columns"
      />
    </div>
    <a-table
      row-key="rolId"
      :columns="visibleColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :row-selection="rowSelection"
      :scroll="{ x: 1100 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isPub'">
          <a-tag :color="record.isPub === 1 ? 'blue' : 'default'">{{
            record.isPub === 1 ? t('role.public') : t('role.organizationRole')
          }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-tooltip :title="t('common.edit')">
              <a-button
                v-if="hasPermission('system:role:save')"
                type="text"
                size="small"
                shape="circle"
                :aria-label="t('common.edit')"
                @click="handleEdit(record)"
              >
                <EditTwoTone :two-tone-color="primaryColor" />
              </a-button>
            </a-tooltip>
            <a-tooltip :title="t('role.permissions')">
              <a-button
                v-if="hasPermission('system:role:bindMenus')"
                type="text"
                size="small"
                shape="circle"
                :aria-label="t('role.permissions')"
                @click="handlePermission(record)"
              >
                <SafetyCertificateTwoTone :two-tone-color="primaryColor" />
              </a-button>
            </a-tooltip>
            <a-tooltip :title="t('common.delete')">
              <a-button
                v-if="hasPermission('system:role:delete')"
                type="text"
                size="small"
                shape="circle"
                :aria-label="t('common.delete')"
                @click="handleDelete(record)"
              >
                <DeleteTwoTone two-tone-color="#ff4d4f" />
              </a-button>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </a-table>

    <RoleModal v-model:open="modalOpen" :record="currentRecord" @success="handleSaved" />
    <RolePermissionModal v-model:open="permissionOpen" :record="currentRecord" @success="permissionOpen = false" />
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  DeleteTwoTone,
  EditTwoTone,
  MinusCircleTwoTone,
  PlusCircleTwoTone,
  SafetyCertificateTwoTone,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

import { getRole, pageRoles, removeRole, removeRoles, type SysRole } from '@/api/system/role'
import { pageAfterDelete } from '@/views/system/shared/data'
import { usePermission } from '@/composables/usePermission'
import TableColumnSetting from '@/components/TableColumnSetting/index.vue'
import RoleModal from './components/RoleModal.vue'
import RolePermissionModal from './components/RolePermissionModal.vue'

const { t } = useI18n()
const { hasPermission } = usePermission()
const appStore = useAppStore()
const primaryColor = computed(() => appStore.primaryColor)

const loading = ref(false)
const dataSource = ref<SysRole[]>([])
const selectedRowKeys = ref<string[]>([])
const currentRecord = ref<SysRole | null>(null)
const modalOpen = ref(false)
const permissionOpen = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => t('common.total', { total }),
})

const columns = computed(() => [
  { title: t('role.name'), dataIndex: 'rolNm', key: 'rolNm', width: 150 },
  { title: t('role.code'), dataIndex: 'rolCd', key: 'rolCd', width: 120 },
  { title: t('role.level'), dataIndex: 'rolLv', key: 'rolLv', width: 80 },
  { title: t('role.organization'), dataIndex: 'orgId', key: 'orgId', width: 150 },
  { title: t('role.type'), key: 'isPub', width: 90 },
  { title: t('role.description'), dataIndex: 'rolDesc', key: 'rolDesc' },
  { title: t('role.createdAt'), dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: t('role.actions'), key: 'action', width: 120, fixed: 'right' as const },
])
const visibleColumnKeys = ref<string[]>(columns.value.map(column => String(column.key ?? column.dataIndex)))
const visibleColumns = computed(() =>
  columns.value.filter(column => visibleColumnKeys.value.includes(String(column.key ?? column.dataIndex))),
)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => (selectedRowKeys.value = keys.map(String)),
}))

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await pageRoles(pagination.current, pagination.pageSize)
    dataSource.value = response.data.records
    pagination.total = response.data.totalRow
    selectedRowKeys.value = []
  } catch (error: any) {
    message.error(error?.message || t('role.loadFailed'))
  } finally {
    loading.value = false
  }
}

const handleTableChange = (page: { current?: number; pageSize?: number }) => {
  pagination.current = page.current ?? 1
  pagination.pageSize = page.pageSize ?? 10
  fetchRoles()
}

const handleAdd = () => {
  currentRecord.value = null
  modalOpen.value = true
}

const handleEdit = async (record: SysRole) => {
  currentRecord.value = (await getRole(record.rolId)).data
  modalOpen.value = true
}

const handlePermission = (record: SysRole) => {
  currentRecord.value = record
  permissionOpen.value = true
}

const handleDelete = (record: SysRole) => {
  Modal.confirm({
    title: t('common.confirm'),
    content: t('role.confirmDelete', { name: record.rolNm }),
    onOk: async () => {
      await removeRole(record.rolId)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, 1)
      message.success(t('common.deleteSuccess'))
      await fetchRoles()
    },
  })
}

const handleBatchDelete = () => {
  const count = selectedRowKeys.value.length
  Modal.confirm({
    title: t('common.confirm'),
    content: t('role.confirmBatchDelete', { count }),
    onOk: async () => {
      await removeRoles(selectedRowKeys.value)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, count)
      message.success(t('common.deleteSuccess'))
      await fetchRoles()
    },
  })
}

const handleSaved = async () => {
  modalOpen.value = false
  await fetchRoles()
}

onMounted(fetchRoles)
</script>

<style lang="scss" scoped>
.table-toolbar {
  margin-bottom: 16px;
  text-align: left;
}
</style>
