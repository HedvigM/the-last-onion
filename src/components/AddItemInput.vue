<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { parsePastedItems, type PastedItem } from '@/lib/parsePastedItems'

const props = defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{
  add: [name: string]
  addMany: [items: PastedItem[]]
}>()
const { t } = useI18n()

const name = ref('')

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed || props.disabled) return
  emit('add', trimmed)
  name.value = ''
}

function onPaste(e: ClipboardEvent) {
  if (props.disabled) {
    e.preventDefault()
    return
  }
  const text = e.clipboardData?.getData('text') ?? ''
  const items = parsePastedItems(text)
  if (items.length === 0) return

  const multiLine = /[\r\n\t]/.test(text) || /[-*•]\s+\[[ xX]?\]/.test(text)
  const hasQuantity = items.some((i) => i.quantity != null)
  if (items.length === 1 && !hasQuantity && !multiLine) return

  e.preventDefault()
  name.value = ''
  emit('addMany', items)
}
</script>

<template>
  <form class="add-item" @submit.prevent="submit">
    <input
      v-model="name"
      type="text"
      :placeholder="t('listItem.addPlaceholder')"
      :disabled="disabled"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      @paste="onPaste"
    />
    <button type="submit" :disabled="disabled || !name.trim()">{{ t('common.add') }}</button>
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

.add-item input:disabled {
  opacity: 0.6;
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
