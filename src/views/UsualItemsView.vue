<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useListsStore } from '@/stores/lists'
import { useCategoriesStore } from '@/stores/categories'
import { useCategoryLabel } from '@/composables/useCategoryLabel'
import { translateApiError } from '@/composables/useApiError'

const route = useRoute()
const listsStore = useListsStore()
const categoriesStore = useCategoriesStore()
const { getCategoryLabel } = useCategoryLabel()
const { t } = useI18n()

const listId = computed(() => route.params.id as string)
const itemQuery = ref('')
const selectedCatalogItemId = ref<string | null>(null)
const showSuggestions = ref(false)

const listName = computed(() => listsStore.currentList?.name ?? '…')

const pinnedCatalogIds = computed(
  () =>
    new Set(
      categoriesStore.usualItems.filter((i) => i.isManual).map((i) => i.catalogItemId),
    ),
)

const listItemOptions = computed(() => {
  const items = listsStore.currentList?.items ?? []
  const seen = new Set<string>()
  const options: {
    catalogItemId: string
    displayName: string
    checked: boolean
    alreadyPinned: boolean
  }[] = []

  for (const item of items) {
    const catalogItemId = item.catalogItem.id
    if (seen.has(catalogItemId)) continue
    seen.add(catalogItemId)
    options.push({
      catalogItemId,
      displayName: item.catalogItem.displayName,
      checked: item.checked,
      alreadyPinned: pinnedCatalogIds.value.has(catalogItemId),
    })
  }

  return options.sort((a, b) => a.displayName.localeCompare(b.displayName))
})

const filteredOptions = computed(() => {
  const available = listItemOptions.value.filter((o) => !o.alreadyPinned)
  const q = itemQuery.value.trim().toLowerCase()
  if (!q) return available
  return available.filter((o) => o.displayName.toLowerCase().includes(q))
})

onMounted(async () => {
  await listsStore.fetchList(listId.value)
  await categoriesStore.fetchUsualItems(listId.value)
})

function usualItemCategoryLabel(item: {
  categoryKey: string | null
  categoryName: string
}) {
  return getCategoryLabel({ key: item.categoryKey, name: item.categoryName })
}

const pinError = ref<string | null>(null)

function syncSelectionFromQuery() {
  const trimmed = itemQuery.value.trim()
  if (!trimmed) {
    selectedCatalogItemId.value = null
    return
  }
  const match = listItemOptions.value.find(
    (o) =>
      !o.alreadyPinned &&
      o.displayName.toLowerCase() === trimmed.toLowerCase(),
  )
  selectedCatalogItemId.value = match?.catalogItemId ?? null
}

function onInput() {
  syncSelectionFromQuery()
  showSuggestions.value = true
}

function pickOption(opt: (typeof listItemOptions.value)[number]) {
  if (opt.alreadyPinned) return
  itemQuery.value = opt.displayName
  selectedCatalogItemId.value = opt.catalogItemId
  showSuggestions.value = false
}

function onBlur() {
  window.setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

async function pinItem() {
  const trimmed = itemQuery.value.trim()
  if (!trimmed) return
  pinError.value = null
  syncSelectionFromQuery()

  try {
    await categoriesStore.pinUsualItem(
      listId.value,
      selectedCatalogItemId.value
        ? { catalogItemId: selectedCatalogItemId.value }
        : { name: trimmed },
    )
    itemQuery.value = ''
    selectedCatalogItemId.value = null
    showSuggestions.value = false
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to pin item'
    pinError.value = translateApiError(message, t)
  }
}

async function unpin(catalogItemId: string) {
  await categoriesStore.unpinUsualItem(listId.value, catalogItemId)
}
</script>

<template>
  <div class="usual-page">
    <h1>{{ t('usualItems.title') }}</h1>
    <p class="list-name">{{ t('usualItems.forList', { name: listName }) }}</p>
    <p class="desc">{{ t('usualItems.desc') }}</p>

    <form class="add-form" @submit.prevent="pinItem">
      <div class="combobox">
        <input
          v-model="itemQuery"
          type="text"
          :placeholder="t('usualItems.placeholder')"
          autocomplete="off"
          @input="onInput"
          @focus="showSuggestions = true"
          @blur="onBlur"
        />
        <ul
          v-if="showSuggestions && filteredOptions.length"
          class="suggestions"
          role="listbox"
        >
          <li
            v-for="opt in filteredOptions"
            :key="opt.catalogItemId"
            role="option"
            @mousedown.prevent="pickOption(opt)"
          >
            <span class="suggestion-name">{{ opt.displayName }}</span>
            <span v-if="opt.checked" class="suggestion-meta">{{ t('usualItems.crossedOff') }}</span>
          </li>
        </ul>
      </div>
      <button type="submit" :disabled="!itemQuery.trim()">{{ t('common.pin') }}</button>
    </form>
    <p v-if="pinError" class="error">{{ pinError }}</p>

    <ul v-if="categoriesStore.usualItems.length" class="usual-list">
      <li v-for="item in categoriesStore.usualItems" :key="item.catalogItemId">
        <div class="item-info">
          <span class="name">{{ item.displayName }}</span>
          <span class="meta">
            {{ usualItemCategoryLabel(item) }}
            ·
            <span v-if="item.isManual">{{ t('usualItems.pinned') }}</span>
            <span v-else>{{ t('usualItems.recently', { count: item.purchaseCount }) }}</span>
          </span>
        </div>
        <button
          v-if="item.isManual"
          type="button"
          class="unpin"
          @click="unpin(item.catalogItemId)"
        >
          {{ t('common.unpin') }}
        </button>
      </li>
    </ul>

    <p v-else class="empty">{{ t('usualItems.empty') }}</p>

    <RouterLink :to="`/lists/${listId}`" class="back">{{ t('usualItems.back') }}</RouterLink>
  </div>
</template>

<style scoped>
.usual-page {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 0.25rem;
}

.list-name {
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0 0 0.5rem;
}

.desc {
  color: var(--muted);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.combobox {
  position: relative;
  flex: 1;
}

.combobox input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
}

.suggestions li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
}

.suggestions li:hover {
  background: color-mix(in srgb, var(--primary) 8%, var(--surface));
}

.suggestion-name {
  font-size: 0.95rem;
}

.suggestion-meta {
  font-size: 0.75rem;
  color: var(--muted);
  flex-shrink: 0;
}

.add-form button {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-start;
}

.add-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.usual-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.usual-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.name {
  font-weight: 500;
  display: block;
}

.meta {
  font-size: 0.75rem;
  color: var(--muted);
}

.unpin {
  padding: 0.25rem 0.75rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.empty {
  color: var(--muted);
  text-align: center;
  padding: 2rem;
}

.error {
  color: var(--danger);
  font-size: 0.875rem;
  margin: -0.75rem 0 1rem;
}

.back {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
}
</style>
