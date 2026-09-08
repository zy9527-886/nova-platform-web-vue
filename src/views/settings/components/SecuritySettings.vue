<template>
  <div class="security-settings">
    <a-form
ref="formRef"
:model="formData"
:rules="rules"
:label-col="{ span: 6 }"
:wrapper-col="{ span: 14 }">
      <a-form-item :label="t('settings.currentPassword')" name="oldPassword">
        <a-input-password v-model:value="formData.oldPassword" :placeholder="t('settings.currentPasswordRequired')" />
      </a-form-item>

      <a-form-item :label="t('settings.newPassword')" name="newPassword">
        <a-input-password v-model:value="formData.newPassword" :placeholder="t('settings.newPasswordRequired')" />
        <div class="password-tip">{{ t('settings.passwordTip') }}</div>
      </a-form-item>

      <a-form-item :label="t('settings.confirmPassword')" name="confirmPassword">
        <a-input-password
          v-model:value="formData.confirmPassword"
          :placeholder="t('settings.confirmPasswordRequired')"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          {{ t('settings.changePassword') }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { changePassword } from '@/api/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject(t('settings.confirmPasswordRequired'))
  }
  if (value !== formData.newPassword) {
    return Promise.reject(t('settings.passwordMismatch'))
  }
  return Promise.resolve()
}

const rules = computed(() => ({
  oldPassword: [{ required: true, message: t('settings.currentPasswordRequired'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('settings.newPasswordRequired'), trigger: 'blur' },
    { min: 8, message: t('settings.passwordMin'), trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
      message: t('settings.passwordComposition'),
      trigger: 'blur',
    },
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}))

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })
      message.success(t('settings.passwordSuccess'))

      // 清空表单
      formData.oldPassword = ''
      formData.newPassword = ''
      formData.confirmPassword = ''
      formRef.value?.resetFields()
    } catch (error: any) {
      message.error(error.message || t('settings.passwordFailed'))
    }
  } catch (error) {
    console.error(t('settings.validationFailed'), error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.security-settings {
  .password-tip {
    margin-top: 4px;
    color: #8c8c8c;
    font-size: 12px;
  }
}
</style>
