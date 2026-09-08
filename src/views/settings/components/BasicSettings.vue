<template>
  <div class="basic-settings">
    <a-form
      :model="formData"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      ref="formRef"
    >
      <a-row :gutter="24">
        <a-col :span="14">
          <a-form-item label="昵称" name="nickname">
            <a-input v-model:value="formData.nickname" placeholder="请输入昵称" />
          </a-form-item>

          <a-form-item label="手机号" name="phone">
            <a-input v-model:value="formData.phone" placeholder="请输入手机号" />
          </a-form-item>

          <a-form-item label="性别" name="gender">
            <a-radio-group v-model:value="formData.gender">
              <a-radio value="male">男</a-radio>
              <a-radio value="female">女</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
            <a-button type="primary" :loading="loading" @click="handleSubmit">
              更新信息
            </a-button>
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <a-avatar :size="144" :src="avatarUrl">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <a-upload
                :show-upload-list="false"
                :before-upload="beforeUpload"
                :customRequest="handleUpload"
              >
                <a-button class="upload-btn">
                  <UploadOutlined />
                  更换头像
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
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, UploadOutlined } from '@ant-design/icons-vue'
import type { FormInstance, UploadProps } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const avatarUrl = ref(userStore.userInfo?.avatar || '')

const formData = reactive({
  nickname: userStore.userInfo?.nickname || '管理员',
  phone: '',
  gender: 'male',
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

const handleUpload = (options: any) => {
  const { file } = options
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target?.result as string
    message.success('头像上传成功')
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    message.success('信息更新成功')
  } catch (error) {
    console.error('表单验证失败', error)
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
