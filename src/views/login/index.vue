<template>
  <div class="login-container">
    <!-- 左上角 Logo -->
    <div class="top-logo">
      <img src="@/assets/images/logo.png" alt="Logo" class="logo-img" />
      <span class="logo-text">Ant Admin Pro</span>
    </div>

    <div class="login-wrapper">
      <div class="login-box">
        <div class="login-header">
          <h2>欢迎登录</h2>
        </div>

        <a-form
          :model="loginForm"
          :rules="rules"
          @finish="handleLogin"
          class="login-form"
          :label-col="{ span: 0 }"
          :wrapper-col="{ span: 24 }"
        >
          <a-form-item name="username">
            <a-input
              v-model:value="loginForm.username"
              size="large"
              placeholder="请输入用户名"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password">
            <a-input-password
              v-model:value="loginForm.password"
              size="large"
              placeholder="请输入密码"
              @pressEnter="handleLogin"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <div class="login-options">
              <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
              <a class="forgot-password">忘记密码？</a>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-footer">
          <p>演示账号：<span>admin</span> / <span>admin123</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const rememberMe = ref(false)
const loginForm = ref({
  username: 'admin',
  password: 'admin123',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.loginAction(loginForm.value.username, loginForm.value.password)
    message.success('登录成功')
    router.push('/')
  } catch (error: any) {
    message.error(error.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  // 左上角 Logo
  .top-logo {
    position: absolute;
    top: 24px;
    left: 24px;
    display: flex;
    align-items: center;
    z-index: 10;

    .logo-img {
      width: 32px;
      height: 32px;
      margin-right: 8px;
      object-fit: contain;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 600;
      color: #262626;
    }
  }

  .login-wrapper {
    width: 100%;
    max-width: 400px;
    padding: 0 20px;

    .login-box {
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
      padding: 40px;

      .login-header {
        text-align: center;
        margin-bottom: 40px;

        h2 {
          font-size: 24px;
          font-weight: 600;
          color: #262626;
          margin: 0;
        }
      }

      .login-form {
        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          .forgot-password {
            color: #1890ff;
            font-size: 14px;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .login-footer {
        text-align: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;

        p {
          color: #8c8c8c;
          font-size: 12px;
          margin: 0;

          span {
            color: #1890ff;
          }
        }
      }
    }
  }
}
</style>
