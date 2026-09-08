export const PRIMARY_COLORS = [
  { name: 'blue', value: '#1677ff' },
  { name: 'red', value: '#f5222d' },
  { name: 'volcano', value: '#fa541c' },
  { name: 'gold', value: '#faad14' },
  { name: 'cyan', value: '#13c2c2' },
  { name: 'green', value: '#52c41a' },
  { name: 'geekblue', value: '#2f54eb' },
  { name: 'purple', value: '#722ed1' },
] as const

export type PrimaryColor = (typeof PRIMARY_COLORS)[number]['value']

export const DEFAULT_PRIMARY_COLOR: PrimaryColor = PRIMARY_COLORS[0].value

export const normalizePrimaryColor = (value: unknown): PrimaryColor => {
  if (typeof value !== 'string') return DEFAULT_PRIMARY_COLOR
  const normalized = value.toLowerCase()
  return PRIMARY_COLORS.find(item => item.value === normalized)?.value ?? DEFAULT_PRIMARY_COLOR
}
