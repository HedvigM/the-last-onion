<script setup lang="ts">
import { ref, computed, onMounted, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { useCategoriesStore } from '@/stores/categories'
import { useGroupedItems } from '@/composables/useGroupedItems'
import { useRealtime } from '@/composables/useRealtime'
import CategorySection from '@/components/CategorySection.vue'
import CheckedSection from '@/components/CheckedSection.vue'
import AddItemInput from '@/components/AddItemInput.vue'
import AddUsualButton from '@/components/AddUsualButton.vue'

const route = useRoute()
const auth = useAuthStore()
const listsStore = useListsStore()
const categoriesStore = useCategoriesStore()

const listId = computed(() => route.params.id as string)
const addingUsual = ref(false)
const isSharedList = computed(() => listsStore.currentList?.isShared === true)

useRealtime(toRef(() => listId.value))

const itemsRef = computed(() => listsStore.currentList?.items)
const categoriesRef = computed(() => categoriesStore.categories)
const { uncheckedByCategory, checkedItems } = useGroupedItems(
  computed(() => itemsRef.value),
  computed(() => categoriesRef.value),
)

onMounted(async () => {
  await listsStore.fetchList(listId.value)
  if (auth.activeHousehold) {
    await categoriesStore.fetchCategories(auth.activeHousehold.id)
  } else if (listsStore.currentList?.householdId) {
    await categoriesStore.fetchCategories(listsStore.currentList.householdId)
  }
})

async function handleAdd(name: string) {
  await listsStore.addItem(listId.value, name)
}

async function handleToggle(itemId: string, checked: boolean) {
  await listsStore.toggleItem(listId.value, itemId, checked)
}

async function handleDelete(itemId: string) {
  await listsStore.deleteItem(listId.value, itemId)
}

async function handleCategoryChange(itemId: string, categoryId: string) {
  await listsStore.updateItemCategory(listId.value, itemId, categoryId)
}

async function handleAddUsual() {
  addingUsual.value = true
  try {
    await listsStore.addUsualItems(listId.value)
  } finally {
    addingUsual.value = false
  }
}
</script>

<template>
  <div class="list-detail">
    <header class="list-header">
      <RouterLink to="/lists" class="back">← Lists</RouterLink>
      <div v-if="isSharedList" class="shared-banner">
        Shared list — you're collaborating with another household
      </div>
      <h1>{{ listsStore.currentList?.name ?? '…' }}</h1>
      <div class="header-actions">
        <AddUsualButton :loading="addingUsual" @click="handleAddUsual" />
        <RouterLink :to="`/lists/${listId}/usual-items`" class="btn-share">
          Edit usual items
        </RouterLink>
        <RouterLink v-if="!isSharedList" :to="`/lists/${listId}/share`" class="btn-share">
          Share
        </RouterLink>
      </div>
    </header>

    <div v-if="listsStore.loading" class="loading">Loading…</div>

    <template v-else>
      <div class="items-container">
        <CategorySection
          v-for="group in uncheckedByCategory"
          :key="group.category.id"
          :category="group.category"
          :items="group.items"
          :all-categories="categoriesStore.categories"
          @toggle="handleToggle"
          @delete="handleDelete"
          @category-change="handleCategoryChange"
        />

        <p v-if="!uncheckedByCategory.length && !checkedItems.length" class="empty">
          Your list is empty. Add items below or tap "Usual items".
        </p>

        <CheckedSection
          :items="checkedItems"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>

      <AddItemInput @add="handleAdd" />
    </template>
  </div>
</template>

<style scoped>
.list-detail {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);
  max-width: 600px;
  margin: 0 auto;
}

.list-header {
  padding: 0 0 1rem;
}

.back {
  font-size: 0.875rem;
  color: var(--primary);
  text-decoration: none;
}

.shared-banner {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: color-mix(in srgb, var(--primary) 10%, var(--surface));
  border: 1px dashed var(--primary);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--primary);
}

h1 {
  margin: 0.5rem 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-share {
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  text-decoration: none;
  color: inherit;
}

.items-container {
  flex: 1;
  overflow-y: auto;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading,
.empty {
  color: var(--muted);
  text-align: center;
  padding: 2rem;
}
</style>
