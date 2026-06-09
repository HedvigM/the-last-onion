import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { Category, UsualItem } from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const usualItems = ref<UsualItem[]>([])
  const loading = ref(false)

  async function fetchCategories(householdId: string) {
    loading.value = true
    try {
      categories.value = await api.getCategories(householdId)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(householdId: string, name: string) {
    const cat = await api.createCategory(householdId, name)
    categories.value.push(cat)
    return cat
  }

  async function updateCategory(categoryId: string, name: string) {
    const cat = await api.updateCategory(categoryId, name)
    const idx = categories.value.findIndex((c) => c.id === categoryId)
    if (idx >= 0) categories.value[idx] = cat
    return cat
  }

  async function deleteCategory(categoryId: string) {
    await api.deleteCategory(categoryId)
    categories.value = categories.value.filter((c) => c.id !== categoryId)
  }

  async function reorderCategories(householdId: string, categoryIds: string[]) {
    await api.reorderCategories(householdId, categoryIds)
    categories.value.sort(
      (a, b) => categoryIds.indexOf(a.id) - categoryIds.indexOf(b.id),
    )
  }

  async function fetchUsualItems(listId: string) {
    usualItems.value = await api.getUsualItems(listId)
  }

  async function pinUsualItem(
    listId: string,
    input: { name?: string; catalogItemId?: string },
  ) {
    const payload = input.catalogItemId
      ? { catalogItemId: input.catalogItemId }
      : { name: (input.name ?? '').trim() }
    const item = await api.pinUsualItem(listId, payload)
    await fetchUsualItems(listId)
    return item
  }

  async function unpinUsualItem(listId: string, catalogItemId: string) {
    await api.unpinUsualItem(listId, catalogItemId)
    usualItems.value = usualItems.value.filter((i) => i.catalogItemId !== catalogItemId)
  }

  return {
    categories,
    usualItems,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    fetchUsualItems,
    pinUsualItem,
    unpinUsualItem,
  }
})
