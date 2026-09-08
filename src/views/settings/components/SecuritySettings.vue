<template>
  <div class="security-settings">
    <a-form
      :model="formData"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      ref="formRef"
    >
      <a-form-item label="当前密码" name="oldPassword">
        <a-input-password
          v-model:value="formData.oldPassword"
          placeholder="请输入当前密码"
        />
      </a-form-item>

      <a-form-item label="新密码" name="newPassword">
        <a-input-password
          v-model:value="formData.newPassword"
          placeholder="请输入新密码"
        />
        <div class="password-tip">密码长度至少8位，包含字母和数字</div>
      </a-form-item>

      <a-form-item label="确认新密码" name="confirmPassword">
        <a-input-password
          v-model:value="formData.confirmPassword"
          placeholder="请再次输入新密码"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          修改密码
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { changePassword } from '@/api/user'

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject('请再次输入新密码')
  }
  if (value !== formData.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const rules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
      message: '密码必须包含字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })
      message.success('密码修改成功，请重新登录')
      
      // 清空表单
      formData.oldPassword = ''
      formData.newPassword = ''
      formData.confirmPassword = ''
      formRef.value?.resetFields()
    } catch (error: any) {
      message.error(error.message || '密码修改失败')
    }
  } catch (error) {
    console.error('表单验证失败', error)
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

