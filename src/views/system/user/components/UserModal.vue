<template>
  <a-modal
    :open="open"
    :title="record ? t('user.editUser') : t('user.addUser')"
    :confirm-loading="loading"
    width="720px"
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
      <a-form-item :label="t('user.username')" name="userNm">
        <a-input v-model:value="formData.userNm" maxlength="64" />
      </a-form-item>
      <a-form-item :label="t('user.realName')" name="realNm">
        <a-input v-model:value="formData.realNm" maxlength="64" />
      </a-form-item>
      <a-form-item :label="t('user.idType')" name="idTyp">
        <a-input v-model:value="formData.idTyp" maxlength="2" :placeholder="t('user.idTypePlaceholder')" />
      </a-form-item>
      <a-form-item :label="t('user.idNo')" name="idNo">
        <a-input v-model:value="formData.idNo" maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('user.phone')" name="tel">
        <a-input v-model:value="formData.tel" maxlength="16" />
      </a-form-item>
      <a-form-item :label="t('user.organization')" name="orgCd">
        <a-input v-model:value="formData.orgCd" maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('user.role')" name="roleIds">
        <a-select
          v-model:value="formData.roleIds"
          mode="multiple"
          :options="roleOptions"
          :loading="rolesLoading"
          :placeholder="t('user.selectRole')"
          allow-clear
        />
      </a-form-item>
      <a-form-item :label="t('user.status')" name="stus">
        <a-radio-group v-model:value="formData.stus">
          <a-radio value="1">{{ t('common.enabled') }}</a-radio>
          <a-radio value="0">{{ t('common.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('user.avatar')" name="icon">
        <a-input v-model:value="formData.icon" :placeholder="t('user.avatarPlaceholder')" />
      </a-form-item>
      <a-form-item :label="t('user.remark')" name="rmk">
        <a-textarea
v-model:value="formData.rmk"
:rows="3"
maxlength="255"
show-count />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

import { listRoles } from '@/api/system/role'
import { saveUser, type SysUser } from '@/api/system/user'
import { toUserRoleList } from '@/views/system/shared/data'

const { t } = useI18n()

const props = defineProps<{ open: boolean; record: SysUser | null }>()
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const rolesLoading = ref(false)
const roles = ref<{ rolId: string; rolNm: string }[]>([])
const roleOptions = computed(() => roles.value.map(role => ({ label: role.rolNm, value: role.rolId })))

const formData = reactive({
  userNm: '',
  realNm: '',
  idTyp: '1',
  idNo: '',
  tel: '',
  orgCd: '',
  roleIds: [] as string[],
  stus: '1',
  icon: '',
  rmk: '',
})

const rules = computed(() => ({
  userNm: [{ required: true, message: t('common.input', { label: t('user.username') }), trigger: 'blur' }],
  stus: [{ required: true, message: t('common.select', { label: t('user.status') }) }],
}))

const fillForm = () => {
  const record = props.record
  Object.assign(formData, {
    userNm: record?.userNm ?? '',
    realNm: record?.realNm ?? '',
    idTyp: record?.idTyp ?? '1',
    idNo: record?.idNo ?? '',
    tel: record?.tel ?? '',
    orgCd: record?.orgCd ?? '',
    roleIds: record?.roles?.map(role => role.rolId) ?? [],
    stus: record?.stus ?? '1',
    icon: record?.icon ?? '',
    rmk: record?.rmk ?? '',
  })
}

watch(
  () => props.open,
  async open => {
    if (!open) return
    fillForm()
    formRef.value?.clearValidate()
    rolesLoading.value = true
    try {
      roles.value = await listRoles()
    } catch {
      message.error(t('user.rolesFailed'))
    } finally {
      rolesLoading.value = false
    }
  },
)

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    await saveUser({
      userId: props.record?.userId,
      userNm: formData.userNm,
      realNm: formData.realNm || undefined,
      idTyp: formData.idTyp || undefined,
      idNo: formData.idNo || undefined,
      tel: formData.tel || undefined,
      orgCd: formData.orgCd || undefined,
      stus: formData.stus,
      icon: formData.icon || undefined,
      rmk: formData.rmk || undefined,
      userRolList: toUserRoleList(formData.roleIds),
    })
    message.success(props.record ? t('user.editSuccess') : t('user.addSuccess'))
    emit('success')
  } catch (error: any) {
    if (!error?.errorFields) message.error(error?.message || t('user.saveFailed'))
  } finally {
    loading.value = false
  }
}
</script>
