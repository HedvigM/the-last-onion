<script setup lang="ts">
import type { ListItem } from '@/types'
import type { Category } from '@/types'

defineProps<{
  item: ListItem
  categories?: Category[]
}>()

const emit = defineEmits<{
  toggle: [checked: boolean]
  delete: []
  categoryChange: [categoryId: string]
}>()
</script>

<template>
  <div class="item-row" :class="{ checked: item.checked }">
    <label class="checkbox-wrap">
      <input
        type="checkbox"
        :checked="item.checked"
        @change="emit('toggle', ($event.target as HTMLInputElement).checked)"
      />
      <span class="item-name">{{ item.catalogItem.displayName }}</span>
    </label>
    <div class="item-actions">
      <select
        v-if="categories && !item.checked"
        class="category-select"
        :value="item.catalogItem.categoryId"
        @change="emit('categoryChange', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <button type="button" class="btn-icon" aria-label="Delete" @click="emit('delete')">
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.item-row.checked {
  opacity: 0.65;
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.checkbox-wrap input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--primary);
  flex-shrink: 0;
}

.item-name {
  font-size: 1rem;
  word-break: break-word;
}

.item-row.checked .item-name {
  text-decoration: line-through;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.category-select {
  font-size: 0.75rem;
  padding: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  max-width: 7rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--muted);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.btn-icon:hover {
  color: var(--danger);
}
</style>
