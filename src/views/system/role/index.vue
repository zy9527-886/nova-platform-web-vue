<template>
  <a-card :bordered="false" title="角色管理">
    <template #extra>
      <a-space>
        <a-button danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">批量删除</a-button>
        <a-button type="primary" @click="handleAdd"><PlusOutlined />新增角色</a-button>
      </a-space>
    </template>
    <a-table
      row-key="rolId"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :row-selection="rowSelection"
      :scroll="{ x: 1100 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isPub'">
          <a-tag :color="record.isPub === 1 ? 'blue' : 'default'">{{ record.isPub === 1 ? '公共' : '机构' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handlePermission(record)">权限</a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
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
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

import { getRole, pageRoles, removeRole, removeRoles, type SysRole } from '@/api/system/role'
import { pageAfterDelete } from '@/views/system/shared/data'
import RoleModal from './components/RoleModal.vue'
import RolePermissionModal from './components/RolePermissionModal.vue'

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
  showTotal: (total: number) => `共 ${total} 条`,
})

const columns = [
  { title: '角色名称', dataIndex: 'rolNm', key: 'rolNm', width: 150 },
  { title: '角色编码', dataIndex: 'rolCd', key: 'rolCd', width: 120 },
  { title: '级别', dataIndex: 'rolLv', key: 'rolLv', width: 80 },
  { title: '机构编号', dataIndex: 'orgId', key: 'orgId', width: 150 },
  { title: '类型', key: 'isPub', width: 90 },
  { title: '描述', dataIndex: 'rolDesc', key: 'rolDesc' },
  { title: '创建时间', dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
]

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
    message.error(error?.message || '获取角色列表失败')
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
    title: '确认删除',
    content: `确定要删除角色“${record.rolNm}”吗？`,
    onOk: async () => {
      await removeRole(record.rolId)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, 1)
      message.success('删除成功')
      await fetchRoles()
    },
  })
}

const handleBatchDelete = () => {
  const count = selectedRowKeys.value.length
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${count} 个角色吗？`,
    onOk: async () => {
      await removeRoles(selectedRowKeys.value)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, count)
      message.success('批量删除成功')
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
