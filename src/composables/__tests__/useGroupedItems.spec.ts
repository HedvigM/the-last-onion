import { describe, it, expect } from 'vitest'
import { computed, ref } from 'vue'
import { useGroupedItems } from '@/composables/useGroupedItems'
import type { Category, ListItem } from '@/types'

const categories: Category[] = [
  { id: 'cat-veg', key: 'vegetables', name: 'Vegetables', sortOrder: 0 },
  { id: 'cat-dairy', key: 'dairy', name: 'Dairy', sortOrder: 1 },
]

function makeItem(
  overrides: Partial<ListItem> & {
    id: string
    name: string
    checked: boolean
    categoryId?: string
  },
): ListItem {
  const categoryId = overrides.categoryId ?? 'cat-veg'
  const cat = categories.find((c) => c.id === categoryId) ?? categories[0]!
  return {
    id: overrides.id,
    listId: 'list-1',
    checked: overrides.checked,
    checkedAt: overrides.checkedAt ?? null,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00Z',
    catalogItem: {
      id: `catalog-${overrides.id}`,
      displayName: overrides.name,
      normalizedName: overrides.name.toLowerCase(),
      categoryId: cat.id,
      category: cat,
    },
  }
}

describe('useGroupedItems', () => {
  it('groups unchecked items by category', () => {
    const items = ref<ListItem[]>([
      makeItem({ id: '1', name: 'Carrots', checked: false }),
      makeItem({ id: '2', name: 'Milk', checked: false, categoryId: 'cat-dairy' }),
    ])
    const cats = ref(categories)
    const { uncheckedByCategory } = useGroupedItems(items, cats)

    expect(uncheckedByCategory.value).toHaveLength(2)
    expect(uncheckedByCategory.value[0]!.items).toHaveLength(1)
  })

  it('sorts checked items by checkedAt descending', () => {
    const items = ref<ListItem[]>([
      makeItem({ id: '1', name: 'Carrots', checked: true, checkedAt: '2026-01-01T10:00:00Z' }),
      makeItem({ id: '2', name: 'Milk', checked: true, checkedAt: '2026-01-02T10:00:00Z' }),
    ])
    const cats = ref(categories)
    const { checkedItems } = useGroupedItems(items, cats)

    expect(checkedItems.value[0]!.id).toBe('2')
    expect(checkedItems.value[1]!.id).toBe('1')
  })
})
