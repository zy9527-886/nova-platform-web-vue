<template>
  <a-dropdown trigger="click" placement="bottomRight" :overlay-class-name="'table-column-setting-overlay'">
    <a-tooltip :title="t('table.columnDisplay')">
      <a-button :aria-label="t('table.columnDisplay')">
        <SettingOutlined />
      </a-button>
    </a-tooltip>
    <template #overlay>
      <div class="table-column-setting" @click.stop>
        <div class="table-column-setting__header">
          <a-checkbox :checked="allVisible" :indeterminate="indeterminate" @change="toggleAll">
            {{ t('table.columnDisplay') }}
          </a-checkbox>
          <a-button type="link" size="small" @click="reset">{{ t('common.reset') }}</a-button>
        </div>
        <div class="table-column-setting__list">
          <a-checkbox
            v-for="column in columns"
            :key="getColumnKey(column)"
            :checked="isVisible(column)"
            @change="handleColumnChange(column, $event)"
          >
            {{ column.title }}
          </a-checkbox>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

type Column = {
  key?: string | number
  dataIndex?: string | string[]
  title?: unknown
}

const props = defineProps<{ columns: Column[] }>()

const visibleKeys = defineModel<string[]>('visibleKeys', { default: () => [] })
const { t } = useI18n()

const getColumnKey = (column: Column) => {
  if (Array.isArray(column.dataIndex)) return column.dataIndex.join('.')
  return String(column.key ?? column.dataIndex ?? '')
}

const allKeys = computed(() => props.columns.map(getColumnKey).filter(Boolean))
const isVisible = (column: Column) => visibleKeys.value.includes(getColumnKey(column))

const allVisible = computed(() => props.columns.every(isVisible))
const indeterminate = computed(() => {
  const visibleCount = props.columns.filter(isVisible).length
  return visibleCount > 0 && visibleCount < props.columns.length
})

const syncVisibleKeys = () => {
  const available = allKeys.value
  const selected = visibleKeys.value.filter(key => available.includes(key))
  if (!selected.length && available.length) {
    visibleKeys.value = available
    return
  }
  if (selected.length !== visibleKeys.value.length) visibleKeys.value = selected
}

watch(allKeys, syncVisibleKeys, { immediate: true })

const toggleColumn = (column: Column, checked: boolean) => {
  const key = getColumnKey(column)
  if (!key) return
  visibleKeys.value = checked
    ? [...new Set([...visibleKeys.value, key])]
    : visibleKeys.value.filter(value => value !== key)
}

const handleColumnChange = (column: Column, event: { target: { checked: boolean } }) => {
  toggleColumn(column, event.target.checked)
}

const toggleAll = (event: { target: { checked: boolean } }) => {
  visibleKeys.value = event.target.checked ? allKeys.value : []
}

const reset = () => {
  visibleKeys.value = allKeys.value
}
</script>

<style lang="scss">
.table-column-setting-overlay {
  .table-column-setting {
    width: 240px;
    padding: 8px 0;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  .table-column-setting__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .table-column-setting__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    padding: 8px 12px 0;
    overflow-y: auto;
  }
}
</style>
