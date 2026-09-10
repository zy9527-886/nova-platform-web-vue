<template>
  <a-drawer
    :open="open"
    placement="right"
    :width="360"
    :closable="true"
    @close="handleClose"
    @update:open="(val: boolean) => emit('update:open', val)"
  >
    <div class="theme-drawer">
      <div class="theme-section">
        <div class="section-title">{{ t('layout.sidebarStyle') }}</div>
        <div class="section-desc">{{ t('layout.sidebarStyleDesc') }}</div>
        <div class="theme-options">
          <div
            v-for="themeOption in themeOptions"
            :key="themeOption.value"
            class="theme-card"
            :class="{ active: currentTheme === themeOption.value }"
            @click="handleThemeChange(themeOption.value)"
          >
            <div class="theme-preview" :class="`theme-${themeOption.value}`">
              <div class="preview-sidebar"></div>
              <div class="preview-content">
                <div class="preview-header"></div>
                <div class="preview-body">
                  <div
                    v-if="currentTheme === themeOption.value && themeOption.value === 'light'"
                    class="check-overlay-body"
                  >
                    <CheckCircleOutlined class="check-icon" />
                  </div>
                </div>
              </div>
              <div
                v-if="currentTheme === themeOption.value && themeOption.value !== 'light'"
                class="check-overlay-full"
              >
                <CheckCircleOutlined class="check-icon" />
              </div>
            </div>
            <div class="theme-label">
              <span>{{ themeOption.label }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="theme-section">
        <div class="section-title">{{ t('layout.themeColor') }}</div>
        <div class="section-desc">{{ t('layout.themeColorDesc') }}</div>
        <div class="color-options">
          <button
            v-for="colorOption in PRIMARY_COLORS"
            :key="colorOption.value"
            type="button"
            class="color-swatch"
            :class="{ active: currentPrimaryColor === colorOption.value }"
            :style="{ backgroundColor: colorOption.value }"
            :title="colorOption.value"
            :aria-label="colorOption.value"
            @click="handlePrimaryColorChange(colorOption.value)"
          >
            <CheckOutlined v-if="currentPrimaryColor === colorOption.value" />
          </button>
        </div>
      </div>
      <div class="theme-section">
        <div class="section-title">{{ t('layout.language') }}</div>
        <div class="section-desc">{{ t('layout.languageDesc') }}</div>
        <a-select
          :value="currentLocale"
          name="locale"
          :options="localeOptions"
          style="width: 100%"
          @change="handleLocaleChange"
        />
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircleOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import type { AppLocale } from '@/locales/types'
import { PRIMARY_COLORS, type PrimaryColor } from '@/theme/colors'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const appStore = useAppStore()
const { t } = useI18n()
const currentTheme = computed(() => appStore.theme)
const currentLocale = computed(() => appStore.locale)
const currentPrimaryColor = computed(() => appStore.primaryColor)

const themeOptions = computed<{ label: string; value: 'light' | 'dark' }[]>(() => [
  { label: t('layout.light'), value: 'light' },
  { label: t('layout.dark'), value: 'dark' },
])

const localeOptions = computed(() => [
  { label: t('locale.zhCN'), value: 'zh-CN' },
  { label: t('locale.zhTW'), value: 'zh-TW' },
  { label: t('locale.en'), value: 'en' },
  { label: t('locale.sw'), value: 'sw' },
])

const handleThemeChange = (theme: 'light' | 'dark') => {
  appStore.setTheme(theme)
}

const handleLocaleChange = (locale: AppLocale) => appStore.setLocale(locale)
const handlePrimaryColorChange = (color: PrimaryColor) => appStore.setPrimaryColor(color)

const handleClose = () => {
  emit('update:open', false)
}
</script>

<style lang="scss" scoped>
.theme-drawer {
    .theme-section {
      margin-bottom: 32px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        margin-bottom: 8px;
      }

      .section-desc {
        margin-bottom: 16px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }

    .theme-options {
      display: flex;
      gap: 16px;
      flex-wrap: nowrap;

      .theme-card {
        flex: 1;
        min-width: 0;
        cursor: pointer;
        transition: all 0.3s;

        .theme-preview {
          width: 100%;
          height: 70px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          border: 1px solid #e8e8e8;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          margin-bottom: 8px;
          position: relative;

          // 默认边框颜色
          border-color: #e8e8e8;

          .preview-sidebar {
            width: 33.33%;
            height: 100%;
            flex-shrink: 0;
          }

          .preview-content {
            width: 66.67%;
            height: 100%;
            position: relative;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;

            .preview-header {
              height: 30%;
              width: 100%;
            }

            .preview-body {
              flex: 1;
              width: 100%;
              position: relative;
            }
          }

          .check-overlay-body {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            pointer-events: none;

            .check-icon {
              color: var(--app-primary-color);
              font-size: 20px;
            }
          }

          .check-overlay {
            position: absolute;
            top: 0;
            left: 33.33%;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            pointer-events: none;

            .check-icon {
              color: var(--app-primary-color);
              font-size: 20px;
            }
          }

          .check-overlay-full {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            pointer-events: none;

            .check-icon {
              color: var(--app-primary-color);
              font-size: 20px;
            }
          }

          // 亮色主题 - 左侧和上方白色，右侧下方灰色，对勾在灰色区域中心
          &.theme-light {
            border-color: #e8e8e8;

            .preview-sidebar {
              background: #ffffff;
            }
            .preview-content {
              .preview-header {
                background: #ffffff;
              }
              .preview-body {
                background: #f0f0f0;
              }
            }
          }

          // 暗色主题 - 左侧深色（黑），右侧上白、右侧下灰
          &.theme-dark {
            border-color: #e8e8e8;

            .preview-sidebar {
              background: #001529;
            }
            .preview-content {
              .preview-header {
                background: #ffffff;
              }
              .preview-body {
                background: #f0f0f0;
              }
            }
          }

        }

        .theme-label {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;
        }

        &.active {
          .theme-preview {
            border-color: var(--app-primary-color);
            box-shadow:
              0 0 0 2px rgba(24, 144, 255, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.08);
          }
        }

        &:hover {
          .theme-preview {
            border-color: var(--app-primary-color);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
          }
        }
      }

    }
  }
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-swatch {
  display: inline-flex;
  width: 26px;
  height: 26px;
  padding: 0;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  border: 0;
  border-radius: 2px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
  }

  &.active {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px rgba(0, 0, 0, 0.14);
  }
}

// 暗色主题下的样式
:deep(.ant-drawer-body) {
  .theme-drawer {
    .theme-section {
      .section-title {
        color: rgba(255, 255, 255, 0.85);
      }
      .section-desc {
        color: rgba(255, 255, 255, 0.45);
      }

      .theme-options {
        .theme-card {
          .theme-label {
            color: rgba(255, 255, 255, 0.65);
          }
        }
      }
    }
  }
}
</style>
