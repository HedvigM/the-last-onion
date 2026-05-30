<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ add: [name: string] }>()

const name = ref('')

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  name.value = ''
}
</script>

<template>
  <form class="add-item" @submit.prevent="submit">
    <input
      v-model="name"
      type="text"
      placeholder="Add item..."
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
    <button type="submit" :disabled="!name.trim()">Add</button>
  </form>
</template>

<style scoped>
.add-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  position: sticky;
  bottom: 0;
}

.add-item input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg);
}

.add-item button {
  padding: 0.75rem 1.25rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.add-item button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
