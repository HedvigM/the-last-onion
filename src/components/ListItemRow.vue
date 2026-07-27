<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ListItem } from '@/types'
import type { Category } from '@/types'
import { useCategoryLabel } from '@/composables/useCategoryLabel'
import { UNITS } from '@/lib/units'

const props = defineProps<{
  item: ListItem
  categories?: Category[]
}>()

const emit = defineEmits<{
  toggle: [checked: boolean]
  delete: []
  categoryChange: [categoryId: string]
  quantityChange: [quantity: number | null, unit: string | null]
}>()

const { getCategoryLabel } = useCategoryLabel()
const { t } = useI18n()

const draftQuantity = ref(quantityToInput(props.item.quantity))
const draftUnit = ref(props.item.unit ?? '')

watch(
  () => [props.item.quantity, props.item.unit] as const,
  ([quantity, unit]) => {
    draftQuantity.value = quantityToInput(quantity)
    draftUnit.value = unit ?? ''
  },
)

function quantityToInput(quantity: number | null): string {
  if (quantity == null) return ''
  return String(quantity)
}

function parseDraftQuantity(): number | null {
  // Browsers / v-model may yield a number for numeric-looking values
  const raw = String(draftQuantity.value ?? '')
    .trim()
    .replace(',', '.')
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

function saveQuantity() {
  const quantity = parseDraftQuantity()
  const unit = draftUnit.value || null
  const prevQty = props.item.quantity
  const prevUnit = props.item.unit
  if (quantity === prevQty && unit === prevUnit) return
  draftQuantity.value = quantityToInput(quantity)
  emit('quantityChange', quantity, unit)
}

function onUnitChange() {
  saveQuantity()
}

function onQuantityKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    ;(e.target as HTMLInputElement).blur()
  }
}
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

    <button type="button" class="btn-icon btn-delete" :aria-label="t('listItem.deleteAria')" @click="emit('delete')">
      ×
    </button>

    <div class="item-controls">
      <div class="qty-fields">
        <input
          v-model="draftQuantity"
          type="text"
          inputmode="decimal"
          class="qty-input"
          :aria-label="t('listItem.quantityAria')"
          autocomplete="off"
          @blur="saveQuantity"
          @keydown="onQuantityKeydown"
        />
        <select
          v-model="draftUnit"
          class="unit-select"
          :aria-label="t('listItem.unitAria')"
          @change="onUnitChange"
        >
          <option value="">{{ t('units.none') }}</option>
          <option v-for="u in UNITS" :key="u" :value="u">{{ t(`units.${u}`) }}</option>
        </select>
      </div>

      <select
        v-if="categories && !item.checked"
        class="category-select"
        :value="item.catalogItem.categoryId"
        @change="emit('categoryChange', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ getCategoryLabel(cat) }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.item-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'name delete'
    'controls controls';
  align-items: center;
  column-gap: 0.35rem;
  row-gap: 0.45rem;
  padding: 0.65rem 0.75rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.item-row.checked {
  opacity: 0.65;
}

.checkbox-wrap {
  grid-area: name;
  display: flex;
  align-items: center;
  gap: 0.65rem;
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
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-row.checked .item-name {
  text-decoration: line-through;
}

.btn-delete {
  grid-area: delete;
}

.item-controls {
  grid-area: controls;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  padding-left: 1.9rem;
}

.qty-fields {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}

.qty-input {
  width: 2.75rem;
  padding: 0.3rem 0.25rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 16px;
  background: var(--bg);
  text-align: right;
}

.unit-select {
  font-size: 16px;
  padding: 0.3rem 0.15rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  max-width: 4.75rem;
}

.category-select {
  font-size: 16px;
  padding: 0.3rem 0.2rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  flex: 1 1 auto;
  min-width: 0;
  max-width: none;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--muted);
  cursor: pointer;
  padding: 0.25rem 0.35rem;
  line-height: 1;
  flex-shrink: 0;
}

.btn-icon:hover {
  color: var(--danger);
}

@media (min-width: 560px) {
  .item-row {
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-areas: 'name controls delete';
    padding: 0.75rem 1rem;
    column-gap: 0.5rem;
  }

  .item-name {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    -webkit-line-clamp: unset;
    -webkit-box-orient: unset;
  }

  .item-controls {
    padding-left: 0;
    flex-shrink: 0;
  }

  .qty-input {
    width: 3.25rem;
  }

  .unit-select {
    max-width: 5.25rem;
  }

  .category-select {
    flex: 0 1 auto;
    max-width: 9rem;
  }
}
</style>
