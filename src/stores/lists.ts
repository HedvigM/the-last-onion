import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { GroceryList, ListItem } from '@/types'

export const useListsStore = defineStore('lists', () => {
  const lists = ref<GroceryList[]>([])
  const currentList = ref<GroceryList | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLists(householdId: string) {
    loading.value = true
    error.value = null
    try {
      lists.value = await api.getLists(householdId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load lists'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createList(householdId: string, name: string) {
    const list = await api.createList(householdId, name)
    lists.value.unshift({ ...list, uncheckedCount: 0 })
    return list
  }

  async function fetchList(listId: string) {
    loading.value = true
    error.value = null
    try {
      currentList.value = await api.getList(listId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load list'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addItem(
    listId: string,
    name: string,
    options?: { categoryId?: string; quantity?: number | null; unit?: string | null },
  ) {
    const item = await api.addItem(listId, name, options)
    if (currentList.value?.id === listId) {
      if (!currentList.value.items) currentList.value.items = []
      const existingIdx = currentList.value.items.findIndex((i) => i.id === item.id)
      if (existingIdx >= 0) {
        currentList.value.items[existingIdx] = item
      } else {
        currentList.value.items.push(item)
      }
    }
    return item
  }

  async function toggleItem(listId: string, itemId: string, checked: boolean) {
    const item = await api.updateItem(listId, itemId, { checked })
    patchItem(listId, item)
    return item
  }

  async function updateItemCategory(listId: string, itemId: string, categoryId: string) {
    const item = await api.updateItem(listId, itemId, { categoryId })
    patchItem(listId, item)
    return item
  }

  async function updateItemQuantity(
    listId: string,
    itemId: string,
    quantity: number | null,
    unit: string | null,
  ) {
    const item = await api.updateItem(listId, itemId, { quantity, unit })
    patchItem(listId, item)
    return item
  }

  async function deleteItem(listId: string, itemId: string) {
    await api.deleteItem(listId, itemId)
    if (currentList.value?.id === listId && currentList.value.items) {
      currentList.value.items = currentList.value.items.filter((i) => i.id !== itemId)
    }
  }

  async function addUsualItems(listId: string) {
    const { added } = await api.addUsualItems(listId)
    if (currentList.value?.id === listId && currentList.value.items) {
      for (const item of added) {
        const idx = currentList.value.items.findIndex((i) => i.id === item.id)
        if (idx >= 0) currentList.value.items[idx] = item
        else currentList.value.items.push(item)
      }
    }
    return added
  }

  function patchItem(listId: string, item: ListItem) {
    if (currentList.value?.id !== listId || !currentList.value.items) return
    const idx = currentList.value.items.findIndex((i) => i.id === item.id)
    if (idx >= 0) currentList.value.items[idx] = item
    else currentList.value.items.push(item)
  }

  function removeItem(listId: string, itemId: string) {
    if (currentList.value?.id !== listId || !currentList.value.items) return
    currentList.value.items = currentList.value.items.filter((i) => i.id !== itemId)
  }

  function handleSocketEvent(
    event: 'item_added' | 'item_updated' | 'item_deleted' | 'list_updated',
    data: ListItem | { id: string; name?: string },
  ) {
    if (!currentList.value) return
    if (event === 'item_added' || event === 'item_updated') {
      patchItem(currentList.value.id, data as ListItem)
    } else if (event === 'item_deleted') {
      removeItem(currentList.value.id, (data as { id: string }).id)
    } else if (event === 'list_updated') {
      currentList.value.name = (data as { name: string }).name
    }
  }

  return {
    lists,
    currentList,
    loading,
    error,
    fetchLists,
    createList,
    fetchList,
    addItem,
    toggleItem,
    updateItemCategory,
    updateItemQuantity,
    deleteItem,
    addUsualItems,
    patchItem,
    removeItem,
    handleSocketEvent,
  }
})
