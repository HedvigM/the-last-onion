<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { parsePastedItems, type PastedItem } from '@/lib/parsePastedItems'

const props = defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{
  add: [name: string]
  addMany: [items: PastedItem[]]
}>()
const { t } = useI18n()

const name = ref('')
/** Parsed paste waiting for the user to confirm with the add button. */
const pending = ref<PastedItem[]>([])

const canSubmit = computed(
  () => !props.disabled && (pending.value.length > 0 || name.value.trim().length > 0),
)

function submit() {
  if (!canSubmit.value) return
  const trimmed = name.value.trim()

  if (pending.value.length > 0) {
    const items = trimmed ? mergeItems(pending.value, parsePastedItems(trimmed)) : pending.value
    pending.value = []
    name.value = ''
    emit('addMany', items)
    return
  }

  // Typed amounts get split out too, so "5 dl vetemjöl" fills the amount fields
  const typed = parsePastedItems(trimmed)
  if (typed.length === 1 && typed[0] && typed[0].quantity != null) {
    emit('addMany', typed)
  } else {
    emit('add', trimmed)
  }
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
  pending.value = mergeItems(pending.value, items)
}

function mergeItems(current: PastedItem[], incoming: PastedItem[]): PastedItem[] {
  const merged = current.map((item) => ({ ...item }))
  const byName = new Map(merged.map((item) => [item.name.toLowerCase(), item]))
  for (const item of incoming) {
    const existing = byName.get(item.name.toLowerCase())
    if (!existing) {
      const copy = { ...item }
      merged.push(copy)
      byName.set(copy.name.toLowerCase(), copy)
    } else if (existing.quantity == null && item.quantity != null) {
      existing.quantity = item.quantity
      existing.unit = item.unit
    }
  }
  return merged
}

function removePending(index: number) {
  pending.value.splice(index, 1)
}

function clearPending() {
  pending.value = []
}

function formatQuantity(item: PastedItem): string {
  if (item.quantity == null) return ''
  return item.unit ? `${item.quantity} ${t(`units.${item.unit}`)}` : String(item.quantity)
}
</script>

<template>
  <form class="add-item" @submit.prevent="submit">
    <div v-if="pending.length" class="pending">
      <div class="pending-head">
        <span>{{ t('listItem.pastedCount', pending.length) }}</span>
        <button type="button" class="pending-clear" @click="clearPending">
          {{ t('listItem.clearPasted') }}
        </button>
      </div>
      <ul class="pending-list">
        <li v-for="(item, index) in pending" :key="`${item.name}-${index}`">
          <span class="pending-name">{{ item.name }}</span>
          <span v-if="item.quantity != null" class="pending-qty">{{ formatQuantity(item) }}</span>
          <button
            type="button"
            class="pending-remove"
            :aria-label="t('listItem.deleteAria')"
            @click="removePending(index)"
          >
            ×
          </button>
        </li>
      </ul>
      <p class="pending-hint">{{ t('listItem.pastedHint') }}</p>
    </div>

    <div class="add-row">
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
      <button type="submit" :disabled="!canSubmit">{{ t('common.add') }}</button>
    </div>
  </form>
</template>

<style scoped>
.add-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  padding-left: calc(1rem + env(safe-area-inset-left, 0px));
  padding-right: calc(1rem + env(safe-area-inset-right, 0px));
  background: var(--surface);
  position: sticky;
  bottom: 0;
}

.add-row {
  display: flex;
  gap: 0.5rem;
}

.pending {
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  max-height: 40vh;
  overflow-y: auto;
}

.pending-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
}

.pending-clear {
  padding: 0;
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.pending-list {
  list-style: none;
  margin: 0.375rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.pending-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.pending-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pending-qty {
  color: var(--muted);
  font-size: 0.8rem;
}

.pending-remove {
  padding: 0 0.25rem;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.pending-hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--muted);
}

.add-row input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  background: var(--bg);
}

.add-row input:disabled {
  opacity: 0.6;
}

.add-row button {
  padding: 0.75rem 1.25rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.add-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
