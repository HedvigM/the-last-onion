import { useI18n } from 'vue-i18n'
import type { Category } from '@/types'

export function useCategoryLabel() {
  const { t } = useI18n()

  function getCategoryLabel(category: Pick<Category, 'key' | 'name'>): string {
    if (category.key) {
      return t(`categories.${category.key}`)
    }
    return category.name
  }

  return { getCategoryLabel }
}
