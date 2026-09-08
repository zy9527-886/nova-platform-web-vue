<template>
  <a-modal
    :open="open"
    :title="record ? '编辑角色' : '新增角色'"
    :confirm-loading="loading"
    destroy-on-close
    @cancel="emit('update:open', false)"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="角色名称" name="rolNm"><a-input v-model:value="formData.rolNm" maxlength="64" /></a-form-item>
      <a-form-item label="角色编码" name="rolCd"><a-input v-model:value="formData.rolCd" maxlength="8" /></a-form-item>
      <a-form-item label="角色级别" name="rolLv"><a-input v-model:value="formData.rolLv" maxlength="8" /></a-form-item>
      <a-form-item label="机构编号" name="orgId"><a-input v-model:value="formData.orgId" maxlength="32" /></a-form-item>
      <a-form-item label="是否公共" name="isPub"><a-switch v-model:checked="isPublic" /></a-form-item>
      <a-form-item label="角色描述" name="rolDesc"><a-textarea v-model:value="formData.rolDesc" :rows="3" maxlength="255" show-count /></a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'

import { saveRole, type SysRole } from '@/api/system/role'

const props = defineProps<{ open: boolean; record: SysRole | null }>()
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const formData = reactive({ rolNm: '', rolCd: '', rolLv: '', rolDesc: '', orgId: '', isPub: 0 })
const isPublic = computed({
  get: () => formData.isPub === 1,
  set: (value: boolean) => (formData.isPub = value ? 1 : 0),
})
const rules = {
  rolNm: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  orgId: [{ required: true, message: '请输入机构编号', trigger: 'blur' }],
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    Object.assign(formData, {
      rolNm: props.record?.rolNm ?? '',
      rolCd: props.record?.rolCd ?? '',
      rolLv: props.record?.rolLv ?? '',
      rolDesc: props.record?.rolDesc ?? '',
      orgId: props.record?.orgId ?? '',
      isPub: props.record?.isPub ?? 0,
    })
    formRef.value?.clearValidate()
  }
)

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    await saveRole({ rolId: props.record?.rolId, ...formData })
    message.success(props.record ? '编辑成功' : '新增成功')
    emit('success')
  } catch (error: any) {
    if (!error?.errorFields) message.error(error?.message || '保存角色失败')
  } finally {
    loading.value = false
  }
}
</script>
