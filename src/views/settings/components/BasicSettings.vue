<template>
  <div class="basic-settings">
    <a-form
ref="formRef"
:model="formData"
:rules="rules"
:label-col="{ span: 6 }"
:wrapper-col="{ span: 14 }">
      <a-row :gutter="24">
        <a-col :span="14">
          <a-form-item :label="t('settings.nickname')" name="nickname">
            <a-input v-model:value="formData.nickname" :placeholder="t('settings.nicknameRequired')" />
          </a-form-item>

          <a-form-item :label="t('settings.phone')" name="phone">
            <a-input v-model:value="formData.phone" :placeholder="t('settings.phoneRequired')" />
          </a-form-item>

          <a-form-item :label="t('settings.gender')" name="gender">
            <a-radio-group v-model:value="formData.gender">
              <a-radio value="male">{{ t('settings.male') }}</a-radio>
              <a-radio value="female">{{ t('settings.female') }}</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
            <a-button type="primary" :loading="loading" @click="handleSubmit">
              {{ t('settings.updateInfo') }}
            </a-button>
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <a-avatar :size="144" :src="avatarUrl">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <a-upload :show-upload-list="false" :before-upload="beforeUpload" :custom-request="handleUpload">
                <a-button class="upload-btn">
                  <UploadOutlined />
                  {{ t('settings.changeAvatar') }}
                </a-button>
              </a-upload>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, UploadOutlined } from '@ant-design/icons-vue'
import type { FormInstance, UploadProps } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const avatarUrl = ref(userStore.userInfo?.avatar || '')

const formData = reactive({
  nickname: userStore.userInfo?.nickname || t('layout.administrator'),
  phone: '',
  gender: 'male',
})

const rules = computed(() => ({
  nickname: [{ required: true, message: t('settings.nicknameRequired'), trigger: 'blur' }],
  phone: [
    { required: true, message: t('settings.phoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: t('settings.phoneInvalid'), trigger: 'blur' },
  ],
  gender: [{ required: true, message: t('settings.genderRequired'), trigger: 'change' }],
}))

const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error(t('settings.jpgPngOnly'))
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error(t('settings.imageTooLarge'))
    return false
  }
  return false // 阻止自动上传
}

const handleUpload = (options: any) => {
  const { file } = options
  const reader = new FileReader()
  reader.onload = e => {
    avatarUrl.value = e.target?.result as string
    message.success(t('settings.avatarSuccess'))
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))

    message.success(t('settings.updateSuccess'))
  } catch (error) {
    console.error(t('settings.validationFailed'), error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.basic-settings {
  .avatar-section {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 20px;

    .avatar-wrapper {
      text-align: center;

      .ant-avatar {
        margin-bottom: 16px;
        border: 4px solid #f0f0f0;
      }

      .upload-btn {
        width: 100%;
      }
    }
  }
}
</style>
