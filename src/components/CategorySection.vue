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
  quantityChange: [itemId: string, quantity: number | null, unit: string | null]
}>()

const { getCategoryLabel } = useCategoryLabel()
</script>

<template>
  <section>
    <h3 class="category-title">{{ getCategoryLabel(category) }}</h3>
    <ListItemRow
      v-for="item in items"
      :key="item.id"
      :item="item"
      :categories="allCategories"
      @toggle="emit('toggle', item.id, $event)"
      @delete="emit('delete', item.id)"
      @category-change="emit('categoryChange', item.id, $event)"
      @quantity-change="(q, u) => emit('quantityChange', item.id, q, u)"
    />
  </section>
</template>

<style scoped>
.category-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text);
  padding: 0.75rem 1rem 0.25rem;
  margin: 0;
  background: var(--secondary);
  border-radius: 0.5rem 0.5rem 0 0;
}
</style>
