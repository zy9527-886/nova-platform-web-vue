<template>
  <a-modal
    :open="open"
    :title="record ? t('role.editRole') : t('role.addRole')"
    :confirm-loading="loading"
    destroy-on-close
    @cancel="emit('update:open', false)"
    @ok="handleSubmit"
  >
    <a-form
ref="formRef"
:model="formData"
:rules="rules"
:label-col="{ span: 6 }"
:wrapper-col="{ span: 18 }">
      <a-form-item
:label="t('role.name')"
name="rolNm"
        ><a-input
v-model:value="formData.rolNm"
maxlength="64"
      /></a-form-item>
      <a-form-item
:label="t('role.code')"
name="rolCd"
        ><a-input
v-model:value="formData.rolCd"
maxlength="8"
      /></a-form-item>
      <a-form-item
:label="t('role.level')"
name="rolLv"
        ><a-input
v-model:value="formData.rolLv"
maxlength="8"
      /></a-form-item>
      <a-form-item
:label="t('role.organization')"
name="orgId"
        ><a-input
v-model:value="formData.orgId"
maxlength="32"
      /></a-form-item>
      <a-form-item :label="t('role.public')" name="isPub"><a-switch v-model:checked="isPublic" /></a-form-item>
      <a-form-item
:label="t('role.description')"
name="rolDesc"
        ><a-textarea
v-model:value="formData.rolDesc"
:rows="3"
maxlength="255"
show-count
      /></a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

import { saveRole, type SysRole } from '@/api/system/role'

const { t } = useI18n()

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
const rules = computed(() => ({
  rolNm: [{ required: true, message: t('common.input', { label: t('role.name') }), trigger: 'blur' }],
  orgId: [{ required: true, message: t('common.input', { label: t('role.organization') }), trigger: 'blur' }],
}))

watch(
  () => props.open,
  open => {
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
  },
)

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    await saveRole({ rolId: props.record?.rolId, ...formData })
    message.success(props.record ? t('role.editSuccess') : t('role.addSuccess'))
    emit('success')
  } catch (error: any) {
    if (!error?.errorFields) message.error(error?.message || t('role.saveFailed'))
  } finally {
    loading.value = false
  }
}
</script>
