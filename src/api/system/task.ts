import { systemRequest, type PageData } from './types'

export interface SysTask {
  tskId: string
  tskTyp: string
  tskNm: string
  tskTbl?: string
  tskDt: string
  stus: '0' | '1' | '2'
  creTm?: string
}

export interface SysTaskQuery {
  tskTyp?: string
  tskNm?: string
  tskDt?: string
  stus?: string
}

export const pageTasks = (current: number, size: number, query: SysTaskQuery = {}) =>
  systemRequest<PageData<SysTask>>({
    url: '/system/sysTsk/page',
    method: 'post',
    data: { current, size, query },
  })

export const removeTask = (taskId: string) =>
  systemRequest<boolean>({ url: `/system/sysTsk/removeById/${taskId}`, method: 'delete' })

export const removeTasks = (taskIds: string[]) =>
  systemRequest<boolean>({ url: '/system/sysTsk/removeByIds', method: 'delete', data: taskIds })
