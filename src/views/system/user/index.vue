<template>
  <div class="user-management">
    <a-card :bordered="false" class="search-card">
      <a-form layout="horizontal">
        <div class="search-grid">
          <div v-for="field in inputFields" :key="field.key" class="search-field">
            <a-form-item :label="field.label" class="filter-item">
              <a-input
                v-model:value="searchForm[field.key]"
                class="filter-control"
                allow-clear
                :placeholder="t('common.input', { label: field.label })"
              />
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item :label="t('user.status')" class="filter-item">
              <a-select
                v-model:value="searchForm.stus"
                class="filter-control"
                allow-clear
                :placeholder="t('common.select', { label: t('user.status') })"
              >
                <a-select-option value="1">{{ t('common.enabled') }}</a-select-option>
                <a-select-option value="0">{{ t('common.disabled') }}</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div class="search-field">
            <a-form-item :label="t('user.role')" class="filter-item">
              <a-select
                v-model:value="searchForm.roleId"
                class="filter-control"
                :options="roleOptions"
                :loading="rolesLoading"
                allow-clear
                show-search
                option-filter-prop="label"
                :placeholder="t('common.select', { label: t('user.role') })"
              />
            </a-form-item>
          </div>
          <div class="search-actions">
            <a-space>
              <a-tooltip :title="t('common.search')">
                <a-button
                  type="primary"
                  :aria-label="t('common.search')"
                  :icon="h(SearchOutlined)"
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
          <a-tooltip :title="t('user.addUser')">
            <a-button :aria-label="t('user.addUser')" @click="handleAdd">
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
      </div>
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
            <a-avatar :src="record.icon"
              ><template #icon><UserOutlined /></template
            ></a-avatar>
          </template>
          <template v-else-if="column.key === 'stus'">
            <a-tag :color="record.stus === '1' ? 'green' : 'red'">{{
              record.stus === '1' ? t('common.enabled') : t('common.disabled')
            }}</a-tag>
          </template>
          <template v-else-if="column.key === 'roles'">
            <a-space wrap>
              <a-tag v-for="role in record.roles || []" :key="role.rolId">{{ role.rolNm }}</a-tag>
              <span v-if="!record.roles?.length">-</span>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-tooltip :title="t('user.detail')">
                <a-button
                  type="text"
                  size="small"
                  shape="circle"
                  :aria-label="t('user.detail')"
                  @click="handleDetail(record)"
                >
                  <EyeTwoTone :two-tone-color="primaryColor" />
                </a-button>
              </a-tooltip>
              <a-tooltip :title="t('common.edit')">
                <a-button
                  type="text"
                  size="small"
                  shape="circle"
                  :aria-label="t('common.edit')"
                  @click="handleEdit(record)"
                >
                  <EditTwoTone :two-tone-color="primaryColor" />
                </a-button>
              </a-tooltip>
              <a-tooltip :title="t('common.delete')">
                <a-button
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
    </a-card>

    <UserModal
      v-model:open="modalOpen"
      :record="currentRecord"
      :readonly="detailMode"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, h } from 'vue'
import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  PlusCircleTwoTone,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  MinusCircleTwoTone,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

import { listRoles } from '@/api/system/role'
import { getUser, pageUsers, removeUser, removeUsers, type SysUser } from '@/api/system/user'
import { buildUserQuery, pageAfterDelete } from '@/views/system/shared/data'
import UserModal from './components/UserModal.vue'

const { t } = useI18n()
const appStore = useAppStore()
const primaryColor = computed(() => appStore.primaryColor)

const loading = ref(false)
const dataSource = ref<SysUser[]>([])
const selectedRowKeys = ref<string[]>([])
const modalOpen = ref(false)
const detailMode = ref(false)
const currentRecord = ref<SysUser | null>(null)
const rolesLoading = ref(false)
const roleOptions = ref<{ label: string; value: string }[]>([])
const inputFields = computed(() => [
  { key: 'userNm' as const, label: t('user.username') },
  { key: 'idNo' as const, label: t('user.idNo') },
  { key: 'realNm' as const, label: t('user.realName') },
  { key: 'tel' as const, label: t('user.phone') },
])
const searchForm = reactive({
  userNm: '',
  idNo: '',
  realNm: '',
  tel: '',
  stus: undefined as string | undefined,
  roleId: undefined as string | undefined,
})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => t('common.total', { total }),
})

const columns = computed(() => [
  { title: t('user.avatar'), key: 'icon', width: 70 },
  { title: t('user.username'), dataIndex: 'userNm', key: 'userNm', width: 140 },
  { title: t('user.realName'), dataIndex: 'realNm', key: 'realNm', width: 140 },
  { title: t('user.phone'), dataIndex: 'tel', key: 'tel', width: 140 },
  { title: t('user.organization'), dataIndex: 'orgCd', key: 'orgCd', width: 140 },
  { title: t('user.role'), key: 'roles', width: 220 },
  { title: t('user.status'), key: 'stus', width: 90 },
  { title: t('user.createdAt'), dataIndex: 'creTm', key: 'creTm', width: 180 },
  { title: t('user.actions'), key: 'action', width: 120, fixed: 'right' as const },
])

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String)
  },
}))

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await pageUsers(pagination.current, pagination.pageSize, buildUserQuery(searchForm))
    dataSource.value = response.data.records
    pagination.total = response.data.totalRow
    selectedRowKeys.value = []
  } catch (error: any) {
    message.error(error?.message || t('user.loadFailed'))
  } finally {
    loading.value = false
  }
}

const fetchRoleOptions = async () => {
  rolesLoading.value = true
  try {
    roleOptions.value = (await listRoles()).map(role => ({ label: role.rolNm, value: role.rolId }))
  } catch (error: any) {
    message.error(error?.message || t('user.rolesFailed'))
  } finally {
    rolesLoading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchUsers()
}

const handleReset = () => {
  Object.assign(searchForm, {
    userNm: '',
    idNo: '',
    realNm: '',
    tel: '',
    stus: undefined,
    roleId: undefined,
  })
  handleSearch()
}

const handleTableChange = (page: { current?: number; pageSize?: number }) => {
  pagination.current = page.current ?? 1
  pagination.pageSize = page.pageSize ?? 10
  fetchUsers()
}

const handleAdd = () => {
  detailMode.value = false
  currentRecord.value = null
  modalOpen.value = true
}

const openExistingUser = async (record: SysUser, readonly: boolean) => {
  try {
    currentRecord.value = (await getUser(record.userId)).data
    detailMode.value = readonly
    modalOpen.value = true
  } catch (error: any) {
    message.error(error?.message || t('user.detailFailed'))
  }
}

const handleDetail = (record: SysUser) => openExistingUser(record, true)
const handleEdit = (record: SysUser) => openExistingUser(record, false)

const handleDelete = (record: SysUser) => {
  Modal.confirm({
    title: t('common.confirm'),
    content: t('user.confirmDelete', { name: record.userNm }),
    onOk: async () => {
      await removeUser(record.userId)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, 1)
      message.success(t('common.deleteSuccess'))
      await fetchUsers()
    },
  })
}

const handleBatchDelete = () => {
  const count = selectedRowKeys.value.length
  Modal.confirm({
    title: t('common.confirm'),
    content: t('user.confirmBatchDelete', { count }),
    onOk: async () => {
      await removeUsers(selectedRowKeys.value)
      pagination.current = pageAfterDelete(pagination.current, dataSource.value.length, count)
      message.success(t('common.deleteSuccess'))
      await fetchUsers()
    },
  })
}

const handleSuccess = async () => {
  modalOpen.value = false
  await fetchUsers()
}

onMounted(() => {
  fetchUsers()
  fetchRoleOptions()
})
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 16px;
}

.table-toolbar {
  margin-bottom: 16px;
  text-align: left;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(3, 260px) minmax(140px, 1fr);
  column-gap: 16px;
  align-items: start;
}

.search-field:nth-child(1) {
  grid-area: 1 / 1;
}
.search-field:nth-child(2) {
  grid-area: 1 / 2;
}
.search-field:nth-child(3) {
  grid-area: 1 / 3;
}
.search-field:nth-child(4) {
  grid-area: 2 / 1;
}
.search-field:nth-child(5) {
  grid-area: 2 / 2;
}
.search-field:nth-child(6) {
  grid-area: 2 / 3;
}

.search-field {
  width: 260px;
}

.search-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  grid-area: 2 / 4;
  padding-bottom: 24px;
}

.filter-item :deep(.ant-form-item-label) {
  flex: 0 0 72px;
}

.filter-item :deep(.ant-form-item-control) {
  flex: 0 0 180px;
  max-width: 180px;
}

.filter-control {
  width: 100%;
}

.primary-icon {
  color: var(--app-primary-color);
}

@media (min-width: 768px) and (max-width: 1199px) {
  .search-grid {
    grid-template-columns: repeat(2, 260px) minmax(140px, 1fr);
  }

  .search-field:nth-child(1) {
    grid-area: 1 / 1;
  }
  .search-field:nth-child(2) {
    grid-area: 1 / 2;
  }
  .search-field:nth-child(3) {
    grid-area: 2 / 1;
  }
  .search-field:nth-child(4) {
    grid-area: 2 / 2;
  }
  .search-field:nth-child(5) {
    grid-area: 3 / 1;
  }
  .search-field:nth-child(6) {
    grid-area: 3 / 2;
  }
  .search-actions {
    grid-area: 3 / 3;
  }
}

@media (max-width: 767px) {
  .search-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .search-field,
  .search-field:nth-child(n),
  .search-actions {
    grid-area: auto;
    width: 100%;
  }

  .filter-item :deep(.ant-form-item-control) {
    flex: 1 1 auto;
    max-width: none;
  }
}
</style>
