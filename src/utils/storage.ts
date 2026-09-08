// 本地存储工具函数

export const Storage = {
  // 设置
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  },

  // 获取
  get<T = any>(key: string): T | null {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    }
    return null
  },

  // 删除
  remove(key: string): void {
    localStorage.removeItem(key)
  },

  // 清空
  clear(): void {
    localStorage.clear()
  },
}

