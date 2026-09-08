<template>
  <div class="user-management">
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline">
        <a-form-item label="用户名">
          <a-input v-model:value="searchForm.userNm" allow-clear placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-model:value="searchForm.realNm" allow-clear placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.stus" allow-clear placeholder="请选择" style="width: 120px">
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" title="用户管理">
      <template #extra>
        <a-space>
          <a-button danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">批量删除</a-button>
          <a-button type="primary" @click="handleAdd">新增用户</a-button>
        </a-space>
      </template>
      <a-table
        row-key="userId"
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <a-avatar :src="record.icon"><template #icon><UserOutlined /></template></a-avatar>
          </template>
          <template v-else-if="column.key === 'stus'">
            <a-tag :color="record.stus === '1' ? 'green' : 'red'">{{ record.stus === '1' ? '启用' : '禁用' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'roles'">
            <a-space wrap>
              <a-tag v-for="role in record.roles || []" :key="role.rolId">{{ role.rolNm }}</a-tag>
              <span v-if="!record.roles?.length">-</span>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <UserModal v-model:open="modalOpen" :record="currentRecord" @success="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

import { getUser, pageUsers, removeUser, removeUsers, type SysUser } from '@/api/system/user'
import { pageAfterDelete } from '@/views/system/shared/data'
import UserModal from './components/UserModal.vue'

const loading = ref(false)
const dataSource = ref<SysUser[]>([])
const selectedRowKeys = ref<string[]>([])
const modalOpen = ref(false)
const currentRecord = ref<SysUser | null>(null)
const searchForm = reactive({ userNm: '', realNm: '', stus: undefined as string | undefined })
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

const columns = [
  { title: '头像', key: 'icon', width: 70 },
  { title: '用户名', dataIndex: 'userNm', key: 'userNm', width: 140 },
  { title: '真实姓名', dataIndex: 'realNm', key: 'realNm', width: 140 },
  { title: '联系电话', dataIndex: 'tel', key: 'tel', width: 140 },
  { title: '机构编码', dataIndex: 'orgCd', key: 'orgCd', width: 140 },
  { title: '角色', key: 'roles', width: 220 },
  { title: '状态', key: 'stus', width: 90 },
  { title: '创建时间', dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' as const },
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String)
  },
}))

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await pageUsers(pagination.current, pagination.pageSize, {
      userNm: searchForm.userNm || undefined,
      realNm: searchForm.realNm || undefined,
      stus: searchForm.stus,
    })
    dataSource.value = response.data.records
    pagination.total = response.data.totalRow
    selectedRowKeys.value = []
  } catch (error: any) {
    message.error(error?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchUsers()
}

const handleReset = () => {
  Object.assign(searchForm, { userNm: '', realNm: '', stus: undefined })
  handleSearch()
}

const handleTableChange = (page: { current?: number; pageSize?: number }) => {
  pagination.current = page.current ?? 1
  pagination.pageSize = page.pageSize ?? 10
  fetchUsers()
}

const handleAdd = () => {
  currentRecord.value = null
  modalOpen.value = true
}

const handleEdit = async (record: SysUser) => {
  try {
    currentRecord.value = (await getUser(record.userId)).data
    modalOpen.value = true
  } catch (error: any) {
    message.error(error?.message || '获取用户详情失败')
  }
}

const handleDelete = (record: SysUser) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户“${record.userNm}”吗？`,
    onOk: async () => {
      await removeUser(record.userId)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, 1)
      message.success('删除成功')
      await fetchUsers()
    },
  })
}

const handleBatchDelete = () => {
  const count = selectedRowKeys.value.length
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${count} 个用户吗？`,
    onOk: async () => {
      await removeUsers(selectedRowKeys.value)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, count)
      message.success('批量删除成功')
      await fetchUsers()
    },
  })
}

const handleSuccess = async () => {
  modalOpen.value = false
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 16px;
}
</style>
