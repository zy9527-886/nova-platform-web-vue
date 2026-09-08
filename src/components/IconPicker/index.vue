<template>
  <a-popover
    v-model:open="popoverOpen"
    trigger="click"
    placement="bottomLeft"
    :overlay-style="{ width: '520px', maxWidth: 'calc(100vw - 48px)' }"
  >
    <template #content>
      <div class="icon-picker">
        <!-- 风格切换：线框 / 实底 / 双色 -->
        <a-tabs v-model:active-key="activeStyle" size="small" class="style-tabs">
          <a-tab-pane key="outlined" :tab="t('menu.outlinedIcons')" />
          <a-tab-pane key="filled" :tab="t('menu.filledIcons')" />
          <a-tab-pane key="twoTone" :tab="t('menu.twoToneIcons')" />
        </a-tabs>

        <!-- 放在 Form.Item 里的内部输入不参与表单收集，包一层 a-form-item-rest -->
        <a-form-item-rest>
          <a-input
v-model:value="keyword"
allow-clear
:placeholder="t('menu.iconSearch')"
class="icon-search">
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-form-item-rest>

        <div class="icon-grid">
          <button
            v-for="name in displayIconNames"
            :key="name"
            type="button"
            class="icon-item"
            :class="{ active: name === value }"
            :title="name"
            @click="selectIcon(name)"
          >
            <component :is="getIcon(name)" class="icon" v-bind="activeStyle === 'twoTone' ? { twoToneColor } : {}" />
          </button>
        </div>
      </div>
    </template>

    <a-input
:value="value"
readonly
:placeholder="t('menu.iconPlaceholder')"
@click="popoverOpen = true">
      <template #prefix>
        <component :is="getIcon(value)" v-if="value" />
        <span v-else style="display: inline-block; width: 14px"></span>
      </template>
    </a-input>
  </a-popover>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import * as Icons from '@ant-design/icons-vue'
import { MenuOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const appStore = useAppStore()

interface Props {
  value?: string
}

interface Emits {
  (e: 'update:value', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const popoverOpen = ref(false)
const keyword = ref('')
const activeStyle = ref<'outlined' | 'filled' | 'twoTone'>('outlined')
const twoToneColor = computed(() => appStore.primaryColor)

const iconsMap = Icons as Record<string, Component>

watch(
  () => popoverOpen.value,
  open => {
    if (open) keyword.value = ''
  },
)

const outlinedIcons = computed(() => Object.keys(Icons).filter(k => /^(?!default$)[A-Z].*Outlined$/.test(k)))

const filledIcons = computed(() => Object.keys(Icons).filter(k => /^(?!default$)[A-Z].*Filled$/.test(k)))

const twoToneIcons = computed(() => Object.keys(Icons).filter(k => /^(?!default$)[A-Z].*TwoTone$/.test(k)))

const displayIconNames = computed(() => {
  let base: string[]
  switch (activeStyle.value) {
    case 'filled':
      base = filledIcons.value
      break
    case 'twoTone':
      base = twoToneIcons.value
      break
    default:
      base = outlinedIcons.value
  }
  const k = keyword.value.trim().toLowerCase()
  if (!k) return base
  return base.filter(n => n.toLowerCase().includes(k))
})

const getIcon = (iconName?: string): Component | null => {
  if (!iconName) return null
  return iconsMap[iconName] || MenuOutlined
}

const selectIcon = (name: string) => {
  emit('update:value', name)
  popoverOpen.value = false
}
</script>

<style scoped lang="scss">
.icon-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.style-tabs {
  margin-bottom: 4px;
}

.icon-search {
  margin-bottom: 4px;
}

.icon-grid {
  max-height: 360px;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 8px;
  padding-right: 4px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.icon-item:hover {
    border-color: var(--app-primary-color);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.12);
}

.icon-item.active {
      border-color: var(--app-primary-color);
  background: #e6f4ff;
}

.icon {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.85);
}
</style>
