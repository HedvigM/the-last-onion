<script setup lang="ts">
import type { ListItem } from '@/types'
import ListItemRow from './ListItemRow.vue'

defineProps<{
  items: ListItem[]
}>()

const emit = defineEmits<{
  toggle: [itemId: string, checked: boolean]
  delete: [itemId: string]
}>()
</script>

<template>
  <section v-if="items.length">
    <h3 class="section-title">Checked off</h3>
    <ListItemRow
      v-for="item in items"
      :key="item.id"
      :item="item"
      @toggle="emit('toggle', item.id, $event)"
      @delete="emit('delete', item.id)"
    />
  </section>
</template>

<style scoped>
.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  border-bottom: 2px solid var(--secondary);
  padding: 0.75rem 1rem 0.25rem;
  margin: 0;
}
</style>
