<script setup lang="ts">
import type { Category, ListItem } from '@/types'
import { useCategoryLabel } from '@/composables/useCategoryLabel'
import ListItemRow from './ListItemRow.vue'

defineProps<{
  category: Category
  items: ListItem[]
  allCategories: Category[]
  collapsed?: boolean
}>()

const emit = defineEmits<{
  toggle: [itemId: string, checked: boolean]
  delete: [itemId: string]
  categoryChange: [itemId: string, categoryId: string]
}>()

const { getCategoryLabel } = useCategoryLabel()
</script>

<template>
  <section class="category-section">
    <h3 class="category-title">{{ getCategoryLabel(category) }}</h3>
    <ListItemRow
      v-for="item in items"
      :key="item.id"
      :item="item"
      :categories="allCategories"
      @toggle="emit('toggle', item.id, $event)"
      @delete="emit('delete', item.id)"
      @category-change="emit('categoryChange', item.id, $event)"
    />
  </section>
</template>

<style scoped>
.category-section {
  margin-bottom: 0.5rem;
}

.category-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  padding: 0.75rem 1rem 0.25rem;
  margin: 0;
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
