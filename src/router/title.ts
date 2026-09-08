export interface TranslatableTitle {
  title?: unknown
  titleKey?: unknown
}

export const resolveTitleKey = (value: TranslatableTitle): string | undefined =>
  typeof value.titleKey === 'string' && value.titleKey ? value.titleKey : undefined
