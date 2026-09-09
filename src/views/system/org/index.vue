<template>
  <div class="org-layout">
    <a-card :bordered="false" class="tree-card" :title="t('org.treeTitle')">
      <a-spin :spinning="treeLoading">
        <a-tree
          v-if="treeData.length"
          v-model:selected-keys="selectedTreeKeys"
          :tree-data="treeData"
          :field-names="{ title: 'orgNm', key: 'orgCd', children: 'children' }"
          default-expand-all
          show-line
          block-node
          @select="handleTreeSelect"
        />
        <a-empty v-else :description="t('common.noData')" />
      </a-spin>
    </a-card>

    <div class="org-content">
      <a-card :bordered="false" class="search-card">
        <a-form class="system-search-form" layout="horizontal">
          <div class="search-grid">
            <div class="search-field">
              <a-form-item
                :label="t('org.code')"
                html-for="org-search-code"
                class="filter-item"
              >
                <a-input
                  id="org-search-code"
                  v-model:value="searchForm.orgCd"
                  class="filter-control"
                  name="orgCd"
                  allow-clear
                  :placeholder="t('common.input', { label: t('org.code') })"
                />
              </a-form-item>
            </div>
            <div class="search-field">
              <a-form-item
                :label="t('org.name')"
                html-for="org-search-name"
                class="filter-item"
              >
                <a-input
                  id="org-search-name"
                  v-model:value="searchForm.orgNm"
                  class="filter-control"
                  name="orgNm"
                  allow-clear
                  :placeholder="t('common.input', { label: t('org.name') })"
                />
              </a-form-item>
            </div>
            <div class="search-field">
              <a-form-item
                :label="t('org.status')"
                html-for="org-search-status"
                class="filter-item"
              >
                <a-select
                  id="org-search-status"
                  v-model:value="searchForm.orgStus"
                  class="filter-control"
                  name="orgStus"
                  allow-clear
                  :placeholder="t('common.select', { label: t('org.status') })"
                >
                  <a-select-option value="1">{{ t('common.enabled') }}</a-select-option>
                  <a-select-option value="0">{{ t('common.disabled') }}</a-select-option>
                </a-select>
              </a-form-item>
            </div>
            <div class="search-actions">
              <a-space>
                <a-tooltip :title="t('common.search')">
                  <a-button
                    type="primary"
                    :icon="h(SearchOutlined)"
                    :aria-label="t('common.search')"
                    @click="handleSearch"
                  >
                    {{ t('common.search') }}
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t('common.reset')">
                  <a-button :aria-label="t('common.reset')" @click="handleReset">
                    <ReloadOutlined class="primary-icon" />
                  </a-button>
                </a-tooltip>
              </a-space>
            </div>
          </div>
        </a-form>
      </a-card>

      <a-card :bordered="false">
        <div class="table-toolbar">
          <a-space>
            <a-tooltip :title="t('org.addOrg')">
              <a-button :aria-label="t('org.addOrg')" @click="handleAdd">
                <PlusCircleTwoTone two-tone-color="#52c41a" />
              </a-button>
            </a-tooltip>
            <a-tooltip :title="t('common.batchDelete')">
              <a-button
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
          row-key="orgId"
          :columns="visibleColumns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          :row-selection="rowSelection"
          :scroll="{ x: 1100 }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'orgStus'">
              <a-tag :color="record.orgStus === '1' ? 'green' : 'red'">
                {{ record.orgStus === '1' ? t('common.enabled') : t('common.disabled') }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-tooltip :title="t('common.detail')">
                  <a-button
type="text"
size="small"
shape="circle"
:aria-label="t('common.detail')"
@click="handleDetail(record)">
                    <EyeTwoTone :two-tone-color="primaryColor" />
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t('common.edit')">
                  <a-button
type="text"
size="small"
shape="circle"
:aria-label="t('common.edit')"
@click="handleEdit(record)">
                    <EditTwoTone :two-tone-color="primaryColor" />
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t('common.delete')">
                  <a-button
type="text"
size="small"
shape="circle"
:aria-label="t('common.delete')"
@click="handleDelete(record)">
                    <DeleteTwoTone two-tone-color="#ff4d4f" />
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <OrgModal
      v-model:open="modalOpen"
      :record="currentRecord"
      :tree="treeData"
      :readonly="detailMode"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  MinusCircleTwoTone,
  PlusCircleTwoTone,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import { Checkbox, message, Modal } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import {
  getOrganization,
  getOrganizationTree,
  pageOrganizations,
  removeOrganization,
  removeOrganizations,
  type SysOrg,
  type SysOrgTree,
} from '@/api/system/org'
import { pageAfterDelete } from '@/views/system/shared/data'
import TableColumnSetting from '@/components/TableColumnSetting/index.vue'
import OrgModal from './components/OrgModal.vue'

const { t } = useI18n()
const appStore = useAppStore()
const primaryColor = computed(() => appStore.primaryColor)
const loading = ref(false)
const treeLoading = ref(false)
const dataSource = ref<SysOrg[]>([])
const treeData = ref<SysOrgTree[]>([])
const selectedTreeKeys = ref<string[]>([])
const selectedRowKeys = ref<string[]>([])
const modalOpen = ref(false)
const detailMode = ref(false)
const currentRecord = ref<SysOrg | null>(null)
const searchForm = reactive({
  orgCd: '',
  orgNm: '',
  orgStus: undefined as string | undefined,
  treeOrgCd: undefined as string | undefined,
})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => t('common.total', { total }),
})
const columns = computed(() => [
  { title: t('org.code'), dataIndex: 'orgCd', key: 'orgCd', width: 150 },
  { title: t('org.name'), dataIndex: 'orgNm', key: 'orgNm', width: 160 },
  { title: t('org.level'), dataIndex: 'orgLvCd', key: 'orgLvCd', width: 80 },
  { title: t('org.address'), dataIndex: 'orgAddr', key: 'orgAddr', width: 220 },
  { title: t('org.contact'), dataIndex: 'ctctPer', key: 'ctctPer', width: 120 },
  { title: t('org.phone'), dataIndex: 'telNo', key: 'telNo', width: 140 },
  { title: t('org.status'), key: 'orgStus', width: 90 },
  { title: t('org.createdAt'), dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: t('org.actions'), key: 'action', width: 120, fixed: 'right' as const },
])
const visibleColumnKeys = ref<string[]>(columns.value.map(column => String(column.key ?? column.dataIndex)))
const visibleColumns = computed(() =>
  columns.value.filter(column => visibleColumnKeys.value.includes(String(column.key ?? column.dataIndex))),
)
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => (selectedRowKeys.value = keys.map(String)),
  columnTitle: h(Checkbox, {
    id: 'org-selection-all',
    name: 'org-selection-all',
    checked:
      dataSource.value.length > 0 &&
      dataSource.value.every((record) => selectedRowKeys.value.includes(record.orgId)),
    indeterminate:
      dataSource.value.some((record) => selectedRowKeys.value.includes(record.orgId)) &&
      !dataSource.value.every((record) => selectedRowKeys.value.includes(record.orgId)),
    'aria-label': `${t('common.select')} ${t('org.treeTitle')}`,
    onChange: (event: { target: { checked: boolean } }) => {
      const visibleKeys = dataSource.value.map((record) => record.orgId)
      selectedRowKeys.value = event.target.checked ? visibleKeys : []
    },
  }),
  getCheckboxProps: (record: SysOrg) => ({
    id: `org-selection-${record.orgId}`,
    name: `org-selection-${record.orgId}`,
    'aria-label': `${t('common.select')} ${record.orgNm}`,
  }),
}))

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

let formIdentityObserver: MutationObserver | undefined
const ensureTreeKeyboardFieldIdentity = () => {
  const keyboardField = document.querySelector<HTMLInputElement>(
    '.tree-card input[aria-label="for screen reader"]',
  )
  if (keyboardField) {
    keyboardField.id = 'org-tree-keyboard-control'
    keyboardField.name = 'org-tree-keyboard-control'
  }
}

onBeforeMount(() => {
  formIdentityObserver = new MutationObserver(ensureTreeKeyboardFieldIdentity)
  formIdentityObserver.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => formIdentityObserver?.disconnect())

const fetchTree = async () => {
  treeLoading.value = true
  try {
    treeData.value = (await getOrganizationTree()).data
  } catch (error: unknown) {
    message.error(errorMessage(error, t('org.treeFailed')))
  } finally {
    treeLoading.value = false
  }
}

const fetchOrganizations = async () => {
  loading.value = true
  try {
    const response = await pageOrganizations(pagination.current, pagination.pageSize, {
      orgCd: searchForm.orgCd || undefined,
      orgNm: searchForm.orgNm || undefined,
      orgStus: searchForm.orgStus,
      treeOrgCd: searchForm.treeOrgCd,
    })
    dataSource.value = response.data.records
    pagination.total = response.data.totalRow
    selectedRowKeys.value = []
  } catch (error: unknown) {
    message.error(errorMessage(error, t('org.loadFailed')))
  } finally {
    loading.value = false
  }
}

const handleTreeSelect = (keys: (string | number)[]) => {
  searchForm.treeOrgCd = keys.length ? String(keys[0]) : undefined
  pagination.current = 1
  fetchOrganizations()
}
const handleSearch = () => {
  pagination.current = 1
  fetchOrganizations()
}
const handleReset = () => {
  Object.assign(searchForm, { orgCd: '', orgNm: '', orgStus: undefined, treeOrgCd: undefined })
  selectedTreeKeys.value = []
  handleSearch()
}
const handleTableChange = (page: { current?: number; pageSize?: number }) => {
  pagination.current = page.current ?? 1
  pagination.pageSize = page.pageSize ?? 10
  fetchOrganizations()
}
const handleAdd = () => {
  detailMode.value = false
  currentRecord.value = null
  modalOpen.value = true
}
const openExisting = async (record: SysOrg, readonly: boolean) => {
  try {
    currentRecord.value = (await getOrganization(record.orgId)).data
    detailMode.value = readonly
    modalOpen.value = true
  } catch (error: unknown) {
    message.error(errorMessage(error, t('org.detailFailed')))
  }
}
const handleDetail = (record: SysOrg) => openExisting(record, true)
const handleEdit = (record: SysOrg) => openExisting(record, false)
const handleDelete = (record: SysOrg) => {
  Modal.confirm({
    title: t('common.confirm'),
    content: t('org.confirmDelete', { name: record.orgNm }),
    onOk: async () => {
      await removeOrganization(record.orgId)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, 1)
      message.success(t('common.deleteSuccess'))
      await Promise.all([fetchTree(), fetchOrganizations()])
    },
  })
}
const handleBatchDelete = () => {
  const count = selectedRowKeys.value.length
  Modal.confirm({
    title: t('common.confirm'),
    content: t('org.confirmBatchDelete', { count }),
    onOk: async () => {
      await removeOrganizations(selectedRowKeys.value)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, count)
      message.success(t('common.deleteSuccess'))
      await Promise.all([fetchTree(), fetchOrganizations()])
    },
  })
}
const handleSuccess = async () => {
  modalOpen.value = false
  await Promise.all([fetchTree(), fetchOrganizations()])
}

onMounted(() => Promise.all([fetchTree(), fetchOrganizations()]))
</script>

<style lang="scss" scoped>
.org-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
.tree-card {
  min-height: 520px;
}
.search-card,
.table-toolbar {
  margin-bottom: 16px;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(2, var(--system-search-field-width)) minmax(140px, 1fr);
  column-gap: 16px;
  align-items: start;
}
.search-field:nth-child(3) {
  grid-area: 2 / 1;
}
.search-actions {
  display: flex;
  grid-area: 2 / 3;
  justify-content: flex-end;
  padding-bottom: 24px;
}
.primary-icon {
  color: var(--app-primary-color);
}
@media (max-width: 1199px) {
  .org-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .tree-card {
    min-height: auto;
    max-height: 320px;
    overflow: auto;
  }
  .search-grid {
    grid-template-columns: repeat(2, var(--system-search-field-width)) minmax(140px, 1fr);
  }
  .search-actions {
    grid-area: 2 / 3;
  }
}
@media (max-width: 767px) {
  .search-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .search-field,
  .search-field:nth-child(3) {
    grid-area: auto;
    width: 100%;
  }
  .search-actions {
    grid-area: auto;
    justify-content: flex-start;
  }
}
</style>
