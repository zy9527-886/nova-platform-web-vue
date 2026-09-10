<template>
  <div class="task-management">
    <SearchPanel>
      <a-form class="system-search-form" layout="horizontal">
        <div class="search-grid">
          <div class="search-field">
            <a-form-item :label="t('task.type')" class="filter-item">
              <a-input v-model:value="searchForm.tskTyp" class="filter-control" allow-clear :placeholder="t('common.input', { label: t('task.type') })" />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item :label="t('task.name')" class="filter-item">
              <a-input v-model:value="searchForm.tskNm" class="filter-control" allow-clear :placeholder="t('common.input', { label: t('task.name') })" />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item :label="t('task.date')" class="filter-item">
              <a-date-picker v-model:value="searchForm.tskDt" class="filter-control" value-format="YYYY-MM-DD" />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item :label="t('task.status')" class="filter-item">
              <a-select v-model:value="searchForm.stus" class="filter-control" :options="statusOptions" allow-clear />
            </a-form-item>
          </div>
          <div class="search-actions">
            <a-space>
              <a-button v-if="hasPermission('system:task:page')" type="primary" :icon="h(SearchOutlined)" @click="handleSearch">{{ t('common.search') }}</a-button>
              <a-button @click="handleReset"><ReloadOutlined class="primary-icon" /></a-button>
            </a-space>
          </div>
        </div>
      </a-form>
    </SearchPanel>

    <a-card :bordered="false" class="system-list-card">
      <div class="table-toolbar">
        <a-tooltip :title="t('common.batchDelete')">
          <a-button v-if="hasPermission('system:task:deleteBatch')" :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
            <MinusCircleTwoTone two-tone-color="#ff4d4f" />
          </a-button>
        </a-tooltip>
        <TableColumnSetting v-model:visible-keys="visibleColumnKeys" :columns="columns" />
      </div>
      <a-table
        row-key="tskId"
        :columns="resizableColumns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <a-tag v-if="column.key === 'stus'" :color="statusColor(record.stus)">{{ statusText(record.stus) }}</a-tag>
          <a-tooltip v-else-if="column.key === 'action'" :title="t('common.delete')">
            <a-button v-if="hasPermission('system:task:delete')" type="text" size="small" shape="circle" @click="handleDelete(record)">
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
import { useI18n } from 'vue-i18n'
import TableColumnSetting from '@/components/TableColumnSetting/index.vue'
import SearchPanel from '@/components/SearchPanel/index.vue'
import { usePermission } from '@/composables/usePermission'
import { useResizableColumns } from '@/composables/useResizableColumns'
import { pageTasks, removeTask, removeTasks, type SysTask } from '@/api/system/task'

const { t } = useI18n()
const { hasPermission } = usePermission()
const loading = ref(false)
const dataSource = ref<SysTask[]>([])
const selectedRowKeys = ref<string[]>([])
const searchForm = reactive({ tskTyp: '', tskNm: '', tskDt: undefined as string | undefined, stus: undefined as string | undefined })
const statusOptions = computed(() => [
  { label: t('task.running'), value: '0' },
  { label: t('task.succeeded'), value: '1' },
  { label: t('task.failed'), value: '2' },
])
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, showTotal: (total: number) => t('common.total', { total }) })
const columns = computed(() => [
  { title: t('task.type'), dataIndex: 'tskTyp', key: 'tskTyp', width: 140 },
  { title: t('task.name'), dataIndex: 'tskNm', key: 'tskNm', width: 180 },
  { title: t('task.table'), dataIndex: 'tskTbl', key: 'tskTbl', width: 180 },
  { title: t('task.date'), dataIndex: 'tskDt', key: 'tskDt', width: 130 },
  { title: t('task.status'), key: 'stus', width: 100 },
  { title: t('task.createdAt'), dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: t('task.actions'), key: 'action', width: 90, fixed: 'right' as const },
])
const visibleColumnKeys = ref<string[]>(columns.value.map(column => String(column.key ?? column.dataIndex)))
const visibleColumns = computed(() => columns.value.filter(column => visibleColumnKeys.value.includes(String(column.key ?? column.dataIndex))))
const { resizableColumns } = useResizableColumns(visibleColumns, 'system-task-column-widths')
const rowSelection = computed(() => ({ selectedRowKeys: selectedRowKeys.value, onChange: (keys: (string | number)[]) => { selectedRowKeys.value = keys.map(String) } }))

const statusText = (status: string) => ({ '0': t('task.running'), '1': t('task.succeeded'), '2': t('task.failed') }[status] ?? '-')
const statusColor = (status: string) => ({ '0': 'processing', '1': 'green', '2': 'red' }[status] ?? 'default')
const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await pageTasks(pagination.current, pagination.pageSize, searchForm)
    dataSource.value = response.data.records
    pagination.total = response.data.totalRow
    selectedRowKeys.value = []
  } catch (error: any) {
    message.error(error?.message || t('task.loadFailed'))
  } finally { loading.value = false }
}
const handleSearch = () => { pagination.current = 1; fetchTasks() }
const handleReset = () => { Object.assign(searchForm, { tskTyp: '', tskNm: '', tskDt: undefined, stus: undefined }); handleSearch() }
const handleTableChange = (page: { current?: number; pageSize?: number }) => { pagination.current = page.current ?? 1; pagination.pageSize = page.pageSize ?? 10; fetchTasks() }
const handleDelete = (task: SysTask) => Modal.confirm({ title: t('common.confirm'), content: t('task.confirmDelete', { name: task.tskNm }), onOk: async () => { await removeTask(task.tskId); message.success(t('common.deleteSuccess')); fetchTasks() } })
const handleBatchDelete = () => Modal.confirm({ title: t('common.confirm'), content: t('task.confirmBatchDelete', { count: selectedRowKeys.value.length }), onOk: async () => { await removeTasks(selectedRowKeys.value); message.success(t('common.deleteSuccess')); fetchTasks() } })

fetchTasks()
</script>

<style lang="scss" scoped>
.table-toolbar { margin-bottom: 8px; display: flex; justify-content: space-between; }
.search-grid { display: grid; grid-template-columns: repeat(3, var(--system-search-field-width)) minmax(140px, 1fr); column-gap: 16px; align-items: start; }
.search-field:nth-child(4) { grid-area: 2 / 1; }
.search-actions { display: flex; align-items: flex-start; justify-content: flex-end; grid-area: 2 / 4; padding-bottom: 0; }
.primary-icon { color: var(--app-primary-color); }
@media (max-width: 767px) { .search-grid { grid-template-columns: minmax(0, 1fr); } .search-field, .search-field:nth-child(n), .search-actions { grid-area: auto; width: 100%; } }
</style>
