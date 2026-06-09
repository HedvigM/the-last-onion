<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setAppLocale } from '@/i18n'
import type { AppLanguage } from '@/types'

const { t, locale } = useI18n()

const currentLocale = computed(() => locale.value as AppLanguage)

function setLanguage(language: AppLanguage) {
  if (currentLocale.value === language) return
  setAppLocale(language)
}
</script>

<template>
  <div class="language-toggle" role="group" :aria-label="t('settings.language')">
    <button
      type="button"
      class="lang-btn"
      :class="{ active: currentLocale === 'en' }"
      @click="setLanguage('en')"
    >
      EN
    </button>
    <button
      type="button"
      class="lang-btn"
      :class="{ active: currentLocale === 'sv' }"
      @click="setLanguage('sv')"
    >
      SV
    </button>
  </div>
</template>

<style scoped>
.language-toggle {
  display: flex;
  gap: 0.25rem;
}

.lang-btn {
  padding: 0.35rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: inherit;
}

.lang-btn.active {
  border-color: var(--primary, #2d6a4f);
  background: color-mix(in srgb, var(--primary, #2d6a4f) 10%, transparent);
  color: var(--primary, #2d6a4f);
}
</style>
