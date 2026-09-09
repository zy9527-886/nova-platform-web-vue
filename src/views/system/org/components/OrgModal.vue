<template>
  <a-modal
    :open="open"
    :title="readonly ? t('org.detailOrg') : record ? t('org.editOrg') : t('org.addOrg')"
    :confirm-loading="loading"
    width="720px"
    destroy-on-close
    @cancel="emit('update:open', false)"
    @ok="handleOk"
  >
    <a-form
ref="formRef"
:model="formData"
:rules="rules"
:label-col="{ span: 6 }"
:wrapper-col="{ span: 18 }">
      <a-form-item :label="t('org.parent')" name="orgPrentId">
        <a-tree-select
          v-model:value="formData.orgPrentId"
          :tree-data="parentOptions"
          :field-names="{ label: 'orgNm', value: 'orgCd', children: 'children' }"
          tree-default-expand-all
          allow-clear
          :disabled="readonly || !!record"
          :placeholder="t('org.root')"
        />
      </a-form-item>
      <a-form-item v-if="record" :label="t('org.code')">
        <a-input :value="record.orgCd" readonly />
      </a-form-item>
      <a-form-item :label="t('org.name')" name="orgNm">
        <a-input v-model:value="formData.orgNm" maxlength="64" :readonly="readonly" />
      </a-form-item>
      <a-form-item :label="t('org.address')" name="orgAddr">
        <a-input v-model:value="formData.orgAddr" maxlength="512" :readonly="readonly" />
      </a-form-item>
      <a-form-item :label="t('org.contact')" name="ctctPer">
        <a-input v-model:value="formData.ctctPer" maxlength="64" :readonly="readonly" />
      </a-form-item>
      <a-form-item :label="t('org.phone')" name="telNo">
        <a-input v-model:value="formData.telNo" maxlength="16" :readonly="readonly" />
      </a-form-item>
      <a-form-item :label="t('org.status')" name="orgStus">
        <a-radio-group v-model:value="formData.orgStus" :disabled="readonly">
          <a-radio value="1">{{ t('common.enabled') }}</a-radio>
          <a-radio value="0">{{ t('common.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('org.description')" name="orgDesc">
        <a-textarea
v-model:value="formData.orgDesc"
:rows="3"
maxlength="255"
show-count
:readonly="readonly" />
      </a-form-item>
      <a-form-item :label="t('org.remark')" name="rmk">
        <a-textarea
v-model:value="formData.rmk"
:rows="3"
maxlength="255"
show-count
:readonly="readonly" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

import { saveOrganization, type SysOrg, type SysOrgTree } from '@/api/system/org'

const { t } = useI18n()
const props = withDefaults(
  defineProps<{ open: boolean; record: SysOrg | null; tree: SysOrgTree[]; readonly?: boolean }>(),
  { readonly: false },
)
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const formData = reactive({
  orgPrentId: '0',
  orgNm: '',
  orgAddr: '',
  ctctPer: '',
  telNo: '',
  orgStus: '1',
  orgDesc: '',
  rmk: '',
})
const parentOptions = computed(() => [
  { orgNm: t('org.root'), orgCd: '0', children: props.tree },
])
const rules = computed(() => ({
  orgNm: [{ required: true, message: t('common.input', { label: t('org.name') }), trigger: 'blur' }],
  orgStus: [{ required: true, message: t('common.select', { label: t('org.status') }) }],
}))

watch(
  () => props.open,
  open => {
    if (!open) return
    Object.assign(formData, {
      orgPrentId: props.record?.orgPrentId ?? '0',
      orgNm: props.record?.orgNm ?? '',
      orgAddr: props.record?.orgAddr ?? '',
      ctctPer: props.record?.ctctPer ?? '',
      telNo: props.record?.telNo ?? '',
      orgStus: props.record?.orgStus ?? '1',
      orgDesc: props.record?.orgDesc ?? '',
      rmk: props.record?.rmk ?? '',
    })
    formRef.value?.clearValidate()
  },
)

const handleOk = async () => {
  if (props.readonly) {
    emit('update:open', false)
    return
  }
  try {
    await formRef.value?.validate()
    loading.value = true
    await saveOrganization({ orgId: props.record?.orgId, ...formData })
    message.success(props.record ? t('org.editSuccess') : t('org.addSuccess'))
    emit('success')
  } catch (error: unknown) {
    const details = error as { errorFields?: unknown; message?: unknown }
    if (!details.errorFields) {
      message.error(typeof details.message === 'string' ? details.message : t('org.saveFailed'))
    }
  } finally {
    loading.value = false
  }
}
</script>
