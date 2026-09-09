<template>
  <a-card :bordered="false">
    <div class="table-toolbar">
      <a-space>
        <a-tooltip :title="t('menu.addMenu')">
          <a-button :aria-label="t('menu.addMenu')" @click="handleAdd()">
            <PlusCircleTwoTone two-tone-color="#52c41a" />
          </a-button>
        </a-tooltip>
        <a-tooltip :title="t('menu.expandAll')">
          <a-button :aria-label="t('menu.expandAll')" @click="expandedRowKeys = allParentIds">
            <PlusSquareTwoTone :two-tone-color="primaryColor" />
          </a-button>
        </a-tooltip>
        <a-tooltip :title="t('menu.collapseAll')">
          <a-button :aria-label="t('menu.collapseAll')" @click="expandedRowKeys = []">
            <MinusSquareTwoTone :two-tone-color="primaryColor" />
          </a-button>
        </a-tooltip>
      </a-space>
      <TableColumnSetting
        v-model:visible-keys="visibleColumnKeys"
        :columns="columns"
      />
    </div>

    <a-table
      row-key="menuId"
      :columns="visibleColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="false"
      :expanded-row-keys="expandedRowKeys"
      :scroll="{ x: 1100 }"
      @expanded-rows-change="(keys: (string | number)[]) => (expandedRowKeys = keys.map(String))"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'icon'">
          <component :is="getIcon(record.icon)" v-if="record.icon" />
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'typ'">
          <a-tag :color="record.typ === '0' ? 'orange' : 'blue'">{{
            record.typ === '0' ? t('menu.button') : t('menu.menu')
          }}</a-tag>
        </template>
        <template v-else-if="column.key === 'isDsp'">
          <a-tag :color="record.isDsp === 1 ? 'green' : 'default'">{{
            record.isDsp === 1 ? t('common.show') : t('common.hide')
          }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-tooltip v-if="record.typ === '1'" :title="t('menu.addChild')">
              <a-button
                type="text"
                size="small"
                shape="circle"
                :aria-label="t('menu.addChild')"
                @click="handleAdd(record)"
              >
                <PlusSquareTwoTone two-tone-color="#52c41a" />
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

    <a-modal
      v-model:open="modalOpen"
      :title="editingId ? t('menu.editMenu') : t('menu.addMenu')"
      :confirm-loading="saving"
      width="680px"
      destroy-on-close
      @ok="handleSave"
    >
      <a-form
ref="formRef"
:model="formData"
:rules="rules"
:label-col="{ span: 6 }"
:wrapper-col="{ span: 18 }">
        <a-form-item
:label="t('menu.name')"
name="menuNm"
          ><a-input
v-model:value="formData.menuNm"
maxlength="64"
        /></a-form-item>
        <a-form-item :label="t('menu.type')" name="typ">
          <a-radio-group v-model:value="formData.typ">
            <a-radio-button value="1">{{ t('menu.menu') }}</a-radio-button>
            <a-radio-button value="0">{{ t('menu.button') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('menu.parent')" name="prentId">
          <a-select
v-model:value="formData.prentId"
:options="parentOptions"
show-search
option-filter-prop="label" />
        </a-form-item>
        <a-form-item
:label="t('menu.path')"
name="path"
          ><a-input
v-model:value="formData.path"
maxlength="128"
        /></a-form-item>
        <a-form-item
:label="t('menu.permissionCode')"
name="permCd"
          ><a-input
v-model:value="formData.permCd"
maxlength="32"
        /></a-form-item>
        <a-form-item
:label="t('menu.source')"
name="menuSource"
          ><a-input
v-model:value="formData.menuSource"
maxlength="30"
        /></a-form-item>
        <a-form-item :label="t('menu.icon')" name="icon"><IconPicker v-model:value="formData.icon" /></a-form-item>
        <a-form-item
:label="t('menu.sort')"
name="sort"
          ><a-input-number
v-model:value="formData.sort"
:min="0"
style="width: 100%"
        /></a-form-item>
        <a-form-item
:label="t('menu.display')"
name="isDsp"
          ><a-switch
            v-model:checked="displayed"
            :checked-children="t('common.show')"
            :un-checked-children="t('common.hide')"
        /></a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  DeleteTwoTone,
  EditTwoTone,
  MenuOutlined,
  MinusSquareTwoTone,
  PlusCircleTwoTone,
  PlusSquareTwoTone,
} from '@ant-design/icons-vue'
import * as Icons from '@ant-design/icons-vue'
import { message, Modal, type FormInstance } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

import { getMenu, listMenus, removeMenu, saveMenu, type SysMenu } from '@/api/menu'
import IconPicker from '@/components/IconPicker/index.vue'
import TableColumnSetting from '@/components/TableColumnSetting/index.vue'
import { buildMenuTree, collectDescendantIds } from '@/views/system/shared/data'

const { t } = useI18n()
const appStore = useAppStore()
const primaryColor = computed(() => appStore.primaryColor)

const loading = ref(false)
const saving = ref(false)
const dataSource = ref<SysMenu[]>([])
const flatMenus = ref<SysMenu[]>([])
const expandedRowKeys = ref<string[]>([])
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const formData = reactive({
  menuNm: '',
  permCd: '',
  path: '',
  prentId: '0',
  sort: 0,
  icon: '',
  typ: '1' as '0' | '1',
  isDsp: 1,
  menuSource: '',
})

const displayed = computed({
  get: () => formData.isDsp === 1,
  set: (value: boolean) => (formData.isDsp = value ? 1 : 0),
})
const rules = computed(() => ({
  menuNm: [{ required: true, message: t('common.input', { label: t('menu.name') }), trigger: 'blur' }],
  typ: [{ required: true, message: t('common.select', { label: t('menu.type') }) }],
  prentId: [{ required: true, message: t('common.select', { label: t('menu.parent') }) }],
  sort: [{ required: true, message: t('common.input', { label: t('menu.sort') }) }],
}))
const columns = computed(() => [
  { title: t('menu.name'), dataIndex: 'menuNm', key: 'menuNm', width: 220 },
  { title: t('menu.icon'), key: 'icon', width: 70 },
  { title: t('menu.type'), key: 'typ', width: 80 },
  { title: t('menu.path'), dataIndex: 'path', key: 'path', width: 220 },
  { title: t('menu.permissionCode'), dataIndex: 'permCd', key: 'permCd', width: 200 },
  { title: t('menu.sort'), dataIndex: 'sort', key: 'sort', width: 80 },
  { title: t('menu.display'), key: 'isDsp', width: 80 },
  { title: t('menu.actions'), key: 'action', width: 120, fixed: 'right' as const },
])
const visibleColumnKeys = ref<string[]>(columns.value.map(column => String(column.key ?? column.dataIndex)))
const visibleColumns = computed(() =>
  columns.value.filter(column => visibleColumnKeys.value.includes(String(column.key ?? column.dataIndex))),
)

const getIcon = (name?: string) => (name ? (Icons as Record<string, any>)[name] || MenuOutlined : null)
const allParentIds = computed(() => flatMenus.value.filter(menu => menu.typ === '1').map(menu => menu.menuId))
const parentOptions = computed(() => {
  const excluded = editingId.value ? collectDescendantIds(dataSource.value, editingId.value) : new Set<string>()
  return [
    { label: t('menu.root'), value: '0' },
    ...flatMenus.value
      .filter(menu => menu.typ === '1' && !excluded.has(menu.menuId))
      .map(menu => ({ label: menu.menuNm, value: menu.menuId })),
  ]
})

const fetchMenus = async () => {
  loading.value = true
  try {
    flatMenus.value = await listMenus()
    dataSource.value = buildMenuTree(flatMenus.value)
  } catch (error: any) {
    message.error(error?.message || t('menu.loadFailed'))
  } finally {
    loading.value = false
  }
}

const resetForm = (prentId = '0') =>
  Object.assign(formData, {
    menuNm: '',
    permCd: '',
    path: '',
    prentId,
    sort: 0,
    icon: '',
    typ: '1',
    isDsp: 1,
    menuSource: '',
  })

const handleAdd = (parent?: SysMenu) => {
  editingId.value = null
  resetForm(parent?.menuId ?? '0')
  modalOpen.value = true
}

const handleEdit = async (record: SysMenu) => {
  try {
    const detail = (await getMenu(record.menuId)).data
    editingId.value = detail.menuId
    Object.assign(formData, {
      menuNm: detail.menuNm,
      permCd: detail.permCd ?? '',
      path: detail.path ?? '',
      prentId: detail.prentId,
      sort: detail.sort,
      icon: detail.icon ?? '',
      typ: detail.typ,
      isDsp: detail.isDsp,
      menuSource: detail.menuSource ?? '',
    })
    modalOpen.value = true
  } catch (error: any) {
    message.error(error?.message || t('menu.detailFailed'))
  }
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    await saveMenu({
      menuId: editingId.value ?? undefined,
      menuNm: formData.menuNm,
      permCd: formData.permCd || undefined,
      path: formData.path || undefined,
      prentId: formData.prentId,
      sort: formData.sort,
      icon: formData.icon || undefined,
      typ: formData.typ,
      isDsp: formData.isDsp,
      menuSource: formData.menuSource || undefined,
    })
    message.success(editingId.value ? t('user.editSuccess') : t('user.addSuccess'))
    modalOpen.value = false
    await fetchMenus()
  } catch (error: any) {
    if (!error?.errorFields) message.error(error?.message || t('menu.saveFailed'))
  } finally {
    saving.value = false
  }
}

const handleDelete = (record: SysMenu) => {
  Modal.confirm({
    title: t('common.confirm'),
    content: t('menu.confirmDelete', { name: record.menuNm }),
    onOk: async () => {
      await removeMenu(record.menuId)
      message.success(t('common.deleteSuccess'))
      await fetchMenus()
    },
  })
}

onMounted(fetchMenus)
</script>

<style lang="scss" scoped>
.table-toolbar {
  margin-bottom: 16px;
  text-align: left;
}
</style>
