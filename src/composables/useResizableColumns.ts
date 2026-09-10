import { computed, onUnmounted, ref, type ComputedRef } from 'vue'

type TableColumn = { key?: string | number; dataIndex?: string | string[]; width?: number; [key: string]: unknown }

const getColumnKey = (column: TableColumn) =>
  Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : String(column.key ?? column.dataIndex ?? '')

const readWidths = (storageKey: string): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

export const useResizableColumns = (columns: ComputedRef<TableColumn[]>, storageKey: string) => {
  const widths = ref<Record<string, number>>(readWidths(storageKey))
  let cleanup: (() => void) | undefined

  const startResize = (event: MouseEvent, column: TableColumn) => {
    if (event.button !== 0 || event.offsetX < (event.currentTarget as HTMLElement).offsetWidth - 8) return
    const key = getColumnKey(column)
    if (!key) return
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widths.value[key] ?? Number(column.width ?? 120)
    const onMove = (moveEvent: MouseEvent) => {
      widths.value = { ...widths.value, [key]: Math.max(80, startWidth + moveEvent.clientX - startX) }
    }
    const onUp = () => {
      localStorage.setItem(storageKey, JSON.stringify(widths.value))
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      cleanup = undefined
    }
    cleanup?.()
    cleanup = onUp
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  onUnmounted(() => cleanup?.())

  const resizableColumns = computed(() =>
    columns.value.map(column => {
      const key = getColumnKey(column)
      return {
        ...column,
        width: widths.value[key] ?? column.width,
        customHeaderCell: () => ({ onMousedown: (event: MouseEvent) => startResize(event, column) }),
      }
    }),
  )

  return { resizableColumns }
}
