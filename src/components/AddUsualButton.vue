<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{ click: [] }>()
const props = defineProps<{ loading?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <button type="button" class="btn-usual" :disabled="props.loading" @click="emit('click')">
    {{ props.loading ? t('listDetail.addingUsual') : t('listDetail.usualItems') }}
  </button>
</template>

<style scoped>
.btn-usual {
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.btn-usual:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
