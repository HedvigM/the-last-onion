<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{ add: [name: string] }>()
const { t } = useI18n()

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
      :placeholder="t('listItem.addPlaceholder')"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
    <button type="submit" :disabled="!name.trim()">{{ t('common.add') }}</button>
  </form>
</template>

<style scoped>
.add-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  padding-left: calc(1rem + env(safe-area-inset-left, 0px));
  padding-right: calc(1rem + env(safe-area-inset-right, 0px));
  background: var(--surface);
  position: sticky;
  bottom: 0;
}

.add-item input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
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
