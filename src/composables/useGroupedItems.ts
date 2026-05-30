import { computed, type Ref } from 'vue'
import type { Category, ListItem } from '@/types'

export function useGroupedItems(
  items: Ref<ListItem[] | undefined>,
  categories: Ref<Category[]>,
) {
  const uncheckedByCategory = computed(() => {
    const unchecked = (items.value ?? []).filter((i) => !i.checked)
    const groups = new Map<string, { category: Category; items: ListItem[] }>()

    for (const cat of categories.value) {
      groups.set(cat.id, { category: cat, items: [] })
    }

    for (const item of unchecked) {
      const catId = item.catalogItem.categoryId
      if (!groups.has(catId)) {
        groups.set(catId, {
          category: item.catalogItem.category,
          items: [],
        })
      }
      groups.get(catId)!.items.push(item)
    }

    return [...groups.values()]
      .filter((g) => g.items.length > 0)
      .sort((a, b) => a.category.sortOrder - b.category.sortOrder)
  })

  const checkedItems = computed(() =>
    (items.value ?? [])
      .filter((i) => i.checked)
      .sort((a, b) => {
        const aTime = a.checkedAt ? new Date(a.checkedAt).getTime() : 0
        const bTime = b.checkedAt ? new Date(b.checkedAt).getTime() : 0
        return bTime - aTime
      }),
  )

  return { uncheckedByCategory, checkedItems }
}
