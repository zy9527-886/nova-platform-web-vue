<template>
  <div class="task-management">
    <a-card :bordered="false" class="search-card">
      <a-form class="system-search-form" layout="horizontal">
        <div class="search-grid">
          <div class="search-field">
            <a-form-item label="任务类型" class="filter-item">
              <a-input v-model:value="searchForm.tskTyp" class="filter-control" allow-clear />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item label="任务名称" class="filter-item">
              <a-input v-model:value="searchForm.tskNm" class="filter-control" allow-clear />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item label="任务日期" class="filter-item">
              <a-date-picker v-model:value="searchForm.tskDt" class="filter-control" value-format="YYYY-MM-DD" />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item label="状态" class="filter-item">
              <a-select v-model:value="searchForm.stus" class="filter-control" :options="statusOptions" allow-clear />
            </a-form-item>
          </div>
          <div class="search-actions">
            <a-space>
              <a-button type="primary" :icon="h(SearchOutlined)" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset"><ReloadOutlined class="primary-icon" /></a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </a-card>

    <a-card :bordered="false">
      <div class="table-toolbar">
        <a-tooltip title="批量删除">
          <a-button :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
            <MinusCircleTwoTone two-tone-color="#ff4d4f" />
          </a-button>
        </a-tooltip>
        <TableColumnSetting v-model:visible-keys="visibleColumnKeys" :columns="columns" />
      </div>
      <a-table
        row-key="tskId"
        :columns="visibleColumns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <a-tag v-if="column.key === 'stus'" :color="statusColor(record.stus)">{{ statusText(record.stus) }}</a-tag>
          <a-tooltip v-else-if="column.key === 'action'" title="删除">
            <a-button type="text" size="small" shape="circle" @click="handleDelete(record)">
              <DeleteTwoTone two-tone-color="#ff4d4f" />
            </a-button>
          </a-tooltip>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { DeleteTwoTone, MinusCircleTwoTone, ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import TableColumnSetting from '@/components/TableColumnSetting/index.vue'
import { pageTasks, removeTask, removeTasks, type SysTask } from '@/api/system/task'

const loading = ref(false)
const dataSource = ref<SysTask[]>([])
const selectedRowKeys = ref<string[]>([])
const searchForm = reactive({ tskTyp: '', tskNm: '', tskDt: undefined as string | undefined, stus: undefined as string | undefined })
const statusOptions = [
  { label: '执行中', value: '0' },
  { label: '成功', value: '1' },
  { label: '失败', value: '2' },
]
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` })
const columns = computed(() => [
  { title: '任务类型', dataIndex: 'tskTyp', key: 'tskTyp', width: 140 },
  { title: '任务名称', dataIndex: 'tskNm', key: 'tskNm', width: 180 },
  { title: '任务表名', dataIndex: 'tskTbl', key: 'tskTbl', width: 180 },
  { title: '任务日期', dataIndex: 'tskDt', key: 'tskDt', width: 130 },
  { title: '状态', key: 'stus', width: 100 },
  { title: '创建时间', dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: '操作', key: 'action', width: 90, fixed: 'right' as const },
])
const visibleColumnKeys = ref<string[]>(columns.value.map(column => String(column.key ?? column.dataIndex)))
const visibleColumns = computed(() => columns.value.filter(column => visibleColumnKeys.value.includes(String(column.key ?? column.dataIndex))))
const rowSelection = computed(() => ({ selectedRowKeys: selectedRowKeys.value, onChange: (keys: (string | number)[]) => { selectedRowKeys.value = keys.map(String) } }))

const statusText = (status: string) => ({ '0': '执行中', '1': '成功', '2': '失败' }[status] ?? '-')
const statusColor = (status: string) => ({ '0': 'processing', '1': 'green', '2': 'red' }[status] ?? 'default')
const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await pageTasks(pagination.current, pagination.pageSize, searchForm)
    dataSource.value = response.data.records
    pagination.total = response.data.totalRow
    selectedRowKeys.value = []
  } catch (error: any) {
    message.error(error?.message || '任务加载失败')
  } finally { loading.value = false }
}
const handleSearch = () => { pagination.current = 1; fetchTasks() }
const handleReset = () => { Object.assign(searchForm, { tskTyp: '', tskNm: '', tskDt: undefined, stus: undefined }); handleSearch() }
const handleTableChange = (page: { current?: number; pageSize?: number }) => { pagination.current = page.current ?? 1; pagination.pageSize = page.pageSize ?? 10; fetchTasks() }
const handleDelete = (task: SysTask) => Modal.confirm({ title: '确认删除', content: `确认删除任务“${task.tskNm}”吗？`, onOk: async () => { await removeTask(task.tskId); message.success('删除成功'); fetchTasks() } })
const handleBatchDelete = () => Modal.confirm({ title: '确认删除', content: `确认删除选中的 ${selectedRowKeys.value.length} 条任务吗？`, onOk: async () => { await removeTasks(selectedRowKeys.value); message.success('删除成功'); fetchTasks() } })

fetchTasks()
</script>

<style lang="scss" scoped>
.search-card { margin-bottom: 16px; }
.table-toolbar { margin-bottom: 16px; display: flex; justify-content: space-between; }
.search-grid { display: grid; grid-template-columns: repeat(3, var(--system-search-field-width)) minmax(140px, 1fr); column-gap: 16px; align-items: start; }
.search-field:nth-child(4) { grid-area: 2 / 1; }
.search-actions { display: flex; align-items: flex-start; justify-content: flex-end; grid-area: 2 / 4; padding-bottom: 24px; }
.primary-icon { color: var(--app-primary-color); }
@media (max-width: 767px) { .search-grid { grid-template-columns: minmax(0, 1fr); } .search-field, .search-field:nth-child(n), .search-actions { grid-area: auto; width: 100%; } }
</style>
