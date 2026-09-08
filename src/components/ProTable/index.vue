<template>
  <div ref="tableContainer" class="pro-table" :class="{ 'pro-table-fullscreen': isFullscreen }">
    <a-card :bordered="false" class="table-card">
      <template #title>
        <span>{{ title }}</span>
      </template>
      <template #extra>
        <div class="table-extra">
          <div class="table-extra-left">
            <slot name="extra"></slot>
            <a-button v-if="showNew" type="primary" @click="handleNew">
              <PlusOutlined />
              {{ t('table.new') }}
            </a-button>
          </div>
          <div class="table-extra-divider"></div>
          <div class="table-extra-right">
            <a-dropdown v-if="showDensity" trigger="click">
              <a-button>
                <ColumnHeightOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="handleDensityChange">
                  <a-menu-item key="default">
                    <CheckOutlined v-if="density === 'default'" />
                    <span style="margin-left: 8px">{{ t('table.densityDefault') }}</span>
                  </a-menu-item>
                  <a-menu-item key="middle">
                    <CheckOutlined v-if="density === 'middle'" />
                    <span style="margin-left: 8px">{{ t('table.densityMiddle') }}</span>
                  </a-menu-item>
                  <a-menu-item key="small">
                    <CheckOutlined v-if="density === 'small'" />
                    <span style="margin-left: 8px">{{ t('table.densitySmall') }}</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <a-button v-if="showRefresh" @click="handleRefresh">
              <ReloadOutlined />
            </a-button>
            <a-dropdown v-if="showColumnSetting" trigger="click" :overlay-style="{ padding: 0 }">
              <a-button>
                <SettingOutlined />
              </a-button>
              <template #overlay>
                <div class="column-setting-dropdown">
                  <div class="column-setting-header">
                    <a-checkbox :checked="allColumnsVisible" :indeterminate="indeterminate" @change="handleSelectAll">
                      <span class="header-title">{{ t('table.columnDisplay') }}</span>
                    </a-checkbox>
                    <a-button type="link" size="small" @click="handleResetColumns">{{ t('common.reset') }}</a-button>
                  </div>
                  <div class="column-setting-list">
                    <draggable
v-model="orderedColumns"
:item-key="getColumnKey"
handle=".drag-handle"
:animation="200">
                      <!-- @vue-ignore -->
                      <template #item="{ element: col }">
                        <div class="column-setting-item">
                          <span class="drag-handle">
                            <span class="drag-dots"></span>
                            <span class="drag-dots"></span>
                            <span class="drag-dots"></span>
                          </span>
                          <a-checkbox
                            :checked="getColumnVisible(col)"
                            @change="(e: CheckboxChangeEvent) => handleColumnCheckboxChange(col, e)"
                            @click.stop
                          >
                            {{ col.title }}
                          </a-checkbox>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </div>
              </template>
            </a-dropdown>
            <a-button v-if="showFullscreen" @click="toggleFullscreen">
              <FullscreenOutlined v-if="!isFullscreen" />
              <FullscreenExitOutlined v-else />
            </a-button>
          </div>
        </div>
      </template>

      <a-table
        :columns="visibleColumns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :size="density"
        :row-key="rowKey"
        :scroll="scroll"
        v-bind="$attrs"
        @change="handleTableChange"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData" :key="String(name)">
          <slot :name="name" v-bind="slotData"></slot>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  PlusOutlined,
  ColumnHeightOutlined,
  ReloadOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckOutlined,
} from '@ant-design/icons-vue'
import type { TableColumnType } from 'ant-design-vue'
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type TableRow = Record<string, unknown>
type ProTableColumn = TableColumnType & { hidden?: boolean }

interface Props {
  title?: string
  dataSource?: TableRow[]
  columns: ProTableColumn[]
  loading?: boolean
  pagination?: Record<string, unknown>
  rowKey?: string | ((record: TableRow) => string)
  scroll?: { x?: number | string; y?: number | string }
  showNew?: boolean
  showDensity?: boolean
  showRefresh?: boolean
  showColumnSetting?: boolean
  showFullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNew: true,
  showDensity: true,
  showRefresh: true,
  showColumnSetting: true,
  showFullscreen: true,
  rowKey: 'id',
})

const emit = defineEmits<{
  (e: 'new'): void
  (e: 'refresh'): void
  (e: 'change', pagination: unknown, filters: unknown, sorter: unknown): void
}>()

const density = ref<'small' | 'middle' | 'default'>('default')
const isFullscreen = ref(false)
const columnsState = ref<Record<string, boolean>>({})
const tableContainer = ref<HTMLElement | null>(null)
const orderedColumns = ref<ProTableColumn[]>([])
const originalColumnsOrder = ref<ProTableColumn[]>([])

type CheckboxChangeEvent = { target: { checked: boolean } }
type ColumnKeyLike = ProTableColumn['key'] | ProTableColumn['dataIndex']

const getStateKey = (key: ColumnKeyLike): string | undefined => {
  if (key === undefined || key === null || key === '') return undefined
  if (Array.isArray(key)) return key.join('.')
  return String(key)
}

watch(
  () => props.columns,
  cols => {
    cols.forEach(col => {
      const stateKey = getStateKey(col.key ?? col.dataIndex)
      if (stateKey && columnsState.value[stateKey] === undefined) {
        columnsState.value[stateKey] = !col.hidden
      }
    })

    const currentLength = orderedColumns.value.length
    const newLength = cols.length
    if (currentLength !== newLength) {
      orderedColumns.value = [...(cols as ProTableColumn[])]
      originalColumnsOrder.value = [...(cols as ProTableColumn[])]
    }
  },
  { immediate: true },
)

const visibleColumns = computed(() => {
  const ordered = (orderedColumns as unknown as { value: ProTableColumn[] }).value
  const baseCols = (props.columns ?? []) as ProTableColumn[]
  const all = [...ordered, ...baseCols] as ProTableColumn[]
  const byKey = new Map<string, ProTableColumn>()

  for (const col of all) {
    const stateKey = getStateKey(col.key ?? col.dataIndex)
    if (!stateKey) continue
    if (byKey.has(stateKey)) continue
    if (!columnsState.value[stateKey]) continue
    byKey.set(stateKey, col)
  }

  return Array.from(byKey.values()) as ProTableColumn[]
})

const allColumnsVisible = computed(() => {
  const columnsSnapshot: ProTableColumn[] = (orderedColumns as unknown as { value: ProTableColumn[] }).value
  return columnsSnapshot.every((col: ProTableColumn) => {
    const stateKey = getStateKey(col.key ?? col.dataIndex)
    return stateKey ? columnsState.value[stateKey] !== false : true
  })
})

const indeterminate = computed(() => {
  const columnsSnapshot: ProTableColumn[] = (orderedColumns as unknown as { value: ProTableColumn[] }).value
  const visibleCount = columnsSnapshot.filter((col: ProTableColumn) => {
    const stateKey = getStateKey(col.key ?? col.dataIndex)
    return stateKey ? columnsState.value[stateKey] !== false : true
  }).length
  return visibleCount > 0 && visibleCount < columnsSnapshot.length
})

const handleColumnCheckboxChange = (col: ProTableColumn, e: CheckboxChangeEvent) => {
  handleColumnToggle(col, e.target.checked)
}

const handleDensityChange = ({ key }: { key: string }) => {
  density.value = key as 'small' | 'middle' | 'default'
}

const handleRefresh = () => {
  emit('refresh')
}

const handleNew = () => {
  emit('new')
}

const getColumnKey = (col: ProTableColumn) => {
  return col.key || col.dataIndex || ''
}

const getColumnVisible = (col: ProTableColumn) => {
  const stateKey = getStateKey(col.key ?? col.dataIndex)
  if (!stateKey) return true
  return columnsState.value[stateKey] !== false
}

const handleColumnToggle = (col: ProTableColumn, visible: boolean) => {
  const stateKey = getStateKey(col.key ?? col.dataIndex)
  if (stateKey) {
    columnsState.value[stateKey] = visible
  }
}

const handleSelectAll = (e: { target: { checked: boolean } }) => {
  const checked = e.target.checked
  orderedColumns.value.forEach(col => {
    const stateKey = getStateKey(col.key ?? col.dataIndex)
    if (stateKey) {
      columnsState.value[stateKey] = checked
    }
  })
}

const handleResetColumns = () => {
  orderedColumns.value = (originalColumnsOrder as unknown as { value: ProTableColumn[] }).value
  props.columns.forEach(col => {
    const stateKey = getStateKey(col.key ?? col.dataIndex)
    if (stateKey) {
      columnsState.value[stateKey] = !col.hidden
    }
  })
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

watch(isFullscreen, value => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const handleTableChange = (pag: unknown, filters: unknown, sorter: unknown) => {
  emit('change', pag, filters, sorter)
}
</script>

<style lang="scss" scoped>
.pro-table {
  .table-card {
    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
    }

    :deep(.ant-card-extra) {
      display: flex;
      align-items: center;
    }
  }

  .table-extra {
    display: flex;
    align-items: center;
    gap: 12px;

    .table-extra-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-extra-divider {
      width: 1px;
      height: 20px;
      background-color: #e8e8e8;
    }

    .table-extra-right {
      display: flex;
      align-items: center;
      gap: 4px;

      :deep(.ant-btn) {
        border: none;
        box-shadow: none;
        padding: 4px 8px;

        &:hover,
        &:focus {
          border: none;
          box-shadow: none;
        }
      }
    }
  }

  &.pro-table-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: #fff;
    overflow: auto;

    .table-card {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.ant-card-body) {
        flex: 1;
        overflow: auto;
      }
    }
  }
}

.column-setting-dropdown {
  width: 280px;
  background: #fff;
  border-radius: 6px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .column-setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    .header-title {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }

    :deep(.ant-checkbox-wrapper) {
      flex: 1;
    }
  }

  .column-setting-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 4px 0;

    .column-setting-item {
      display: flex;
      align-items: center;
      padding: 4px 16px;
      cursor: move;
      transition: background-color 0.2s;

      &:hover {
        background-color: #fafafa;
      }

      .drag-handle {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 16px;
        height: 24px;
        margin-right: 8px;
        cursor: move;
        color: #bfbfbf;

        .drag-dots {
          display: block;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background-color: #bfbfbf;
          margin: 1px 0;
        }
      }

      :deep(.ant-checkbox-wrapper) {
        flex: 1;
        margin-left: 0;
        font-size: 14px;
      }
    }
  }
}
</style>
