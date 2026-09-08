<template>
  <a-card :bordered="false" title="菜单管理">
    <template #extra>
      <a-space>
        <a-button @click="expandedRowKeys = allParentIds">展开全部</a-button>
        <a-button @click="expandedRowKeys = []">收起全部</a-button>
        <a-button type="primary" @click="handleAdd()"><PlusOutlined />新增菜单</a-button>
      </a-space>
    </template>

    <a-table
      row-key="menuId"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="false"
      :expanded-row-keys="expandedRowKeys"
      :scroll="{ x: 1100 }"
      @expandedRowsChange="(keys: (string | number)[]) => (expandedRowKeys = keys.map(String))"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'icon'">
          <component :is="getIcon(record.icon)" v-if="record.icon" />
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'typ'">
          <a-tag :color="record.typ === '0' ? 'orange' : 'blue'">{{ record.typ === '0' ? '按钮' : '菜单' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'isDsp'">
          <a-tag :color="record.isDsp === 1 ? 'green' : 'default'">{{ record.isDsp === 1 ? '显示' : '隐藏' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-if="record.typ === '1'" type="link" size="small" @click="handleAdd(record)">新增子项</a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editingId ? '编辑菜单' : '新增菜单'"
      :confirm-loading="saving"
      width="680px"
      destroy-on-close
      @ok="handleSave"
    >
      <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="菜单名称" name="menuNm"><a-input v-model:value="formData.menuNm" maxlength="64" /></a-form-item>
        <a-form-item label="类型" name="typ">
          <a-radio-group v-model:value="formData.typ">
            <a-radio-button value="1">菜单</a-radio-button>
            <a-radio-button value="0">按钮</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="上级菜单" name="prentId">
          <a-select v-model:value="formData.prentId" :options="parentOptions" show-search option-filter-prop="label" />
        </a-form-item>
        <a-form-item label="路径" name="path"><a-input v-model:value="formData.path" maxlength="128" /></a-form-item>
        <a-form-item label="权限码" name="permCd"><a-input v-model:value="formData.permCd" maxlength="32" /></a-form-item>
        <a-form-item label="菜单来源" name="menuSource"><a-input v-model:value="formData.menuSource" maxlength="30" /></a-form-item>
        <a-form-item label="图标" name="icon"><IconPicker v-model:value="formData.icon" /></a-form-item>
        <a-form-item label="排序" name="sort"><a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" /></a-form-item>
        <a-form-item label="是否显示" name="isDsp"><a-switch v-model:checked="displayed" checked-children="显示" un-checked-children="隐藏" /></a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { MenuOutlined, PlusOutlined } from '@ant-design/icons-vue'
import * as Icons from '@ant-design/icons-vue'
import { message, Modal, type FormInstance } from 'ant-design-vue'

import { getMenu, listMenus, removeMenu, saveMenu, type SysMenu } from '@/api/menu'
import IconPicker from '@/components/IconPicker/index.vue'
import { buildMenuTree, collectDescendantIds } from '@/views/system/shared/data'

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
const rules = {
  menuNm: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  typ: [{ required: true, message: '请选择类型' }],
  prentId: [{ required: true, message: '请选择上级菜单' }],
  sort: [{ required: true, message: '请输入排序' }],
}
const columns = [
  { title: '菜单名称', dataIndex: 'menuNm', key: 'menuNm', width: 220 },
  { title: '图标', key: 'icon', width: 70 },
  { title: '类型', key: 'typ', width: 80 },
  { title: '路径', dataIndex: 'path', key: 'path', width: 220 },
  { title: '权限码', dataIndex: 'permCd', key: 'permCd', width: 200 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '显示', key: 'isDsp', width: 80 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' as const },
]

const getIcon = (name?: string) => (name ? (Icons as Record<string, any>)[name] || MenuOutlined : null)
const allParentIds = computed(() => flatMenus.value.filter((menu) => menu.typ === '1').map((menu) => menu.menuId))
const parentOptions = computed(() => {
  const excluded = editingId.value ? collectDescendantIds(dataSource.value, editingId.value) : new Set<string>()
  return [
    { label: '根菜单', value: '0' },
    ...flatMenus.value
      .filter((menu) => menu.typ === '1' && !excluded.has(menu.menuId))
      .map((menu) => ({ label: menu.menuNm, value: menu.menuId })),
  ]
})

const fetchMenus = async () => {
  loading.value = true
  try {
    flatMenus.value = await listMenus()
    dataSource.value = buildMenuTree(flatMenus.value)
  } catch (error: any) {
    message.error(error?.message || '获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

const resetForm = (prentId = '0') => Object.assign(formData, {
  menuNm: '', permCd: '', path: '', prentId, sort: 0, icon: '', typ: '1', isDsp: 1, menuSource: '',
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
    message.error(error?.message || '获取菜单详情失败')
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
    message.success(editingId.value ? '修改成功' : '新增成功')
    modalOpen.value = false
    await fetchMenus()
  } catch (error: any) {
    if (!error?.errorFields) message.error(error?.message || '保存菜单失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = (record: SysMenu) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除菜单“${record.menuNm}”吗？`,
    onOk: async () => {
      await removeMenu(record.menuId)
      message.success('删除成功')
      await fetchMenus()
    },
  })
}

onMounted(fetchMenus)
</script>
