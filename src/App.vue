<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useOffline } from '@/composables/useOffline'
import { updateServiceWorker } from '@/pwa'

const auth = useAuthStore()
const route = useRoute()
const { t } = useI18n()
const { isOnline } = useOffline()
const showUpdatePrompt = ref(false)

const showNav = computed(
  () =>
    auth.isAuthenticated &&
    !route.meta.guest &&
    !route.meta.marketing &&
    route.name !== 'list-detail',
)

const isMarketing = computed(() => !!route.meta.marketing)

function onNeedRefresh() {
  showUpdatePrompt.value = true
}

async function applyUpdate() {
  await updateServiceWorker?.(true)
}

onMounted(async () => {
  window.addEventListener('pwa:need-refresh', onNeedRefresh)
  if (localStorage.getItem('token')) {
    await auth.fetchMe()
  }
})

onUnmounted(() => {
  window.removeEventListener('pwa:need-refresh', onNeedRefresh)
})
</script>

<template>
  <div id="app-root">
    <div v-if="!isOnline" class="offline-banner" role="status">
      {{ t('pwa.offline') }}
    </div>
    <div v-if="showUpdatePrompt" class="update-banner" role="alert">
      <span>{{ t('pwa.updateAvailable') }}</span>
      <button type="button" @click="applyUpdate">{{ t('common.update') }}</button>
      <button type="button" class="dismiss" @click="showUpdatePrompt = false">
        {{ t('common.later') }}
      </button>
    </div>
    <nav v-if="showNav" class="app-nav">
      <RouterLink to="/lists" class="brand">{{ t('nav.brand') }}</RouterLink>
      <div class="nav-links">
        <RouterLink to="/lists">{{ t('nav.lists') }}</RouterLink>
        <RouterLink to="/settings">{{ t('nav.settings') }}</RouterLink>
      </div>
    </nav>
    <main class="app-main" :class="{ 'app-main--flush': isMarketing }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.offline-banner {
  padding: 0.5rem 1rem;
  background: #664d03;
  color: #fff3cd;
  text-align: center;
  font-size: 0.875rem;
  position: sticky;
  top: 0;
  z-index: 200;
}

.update-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  font-size: 0.875rem;
  position: sticky;
  top: 0;
  z-index: 200;
}

.update-banner button {
  padding: 0.25rem 0.75rem;
  border: 1px solid white;
  border-radius: 6px;
  background: white;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}

.update-banner button.dismiss {
  background: transparent;
  color: white;
}

.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
  padding-left: calc(1rem + env(safe-area-inset-left, 0px));
  padding-right: calc(1rem + env(safe-area-inset-right, 0px));
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-weight: 700;
  text-decoration: none;
  color: inherit;
  font-size: 1rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-links a.router-link-active {
  color: var(--primary);
}

.app-main {
  padding: 1rem;
  padding-left: calc(1rem + env(safe-area-inset-left, 0px));
  padding-right: calc(1rem + env(safe-area-inset-right, 0px));
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  min-height: calc(100vh - 52px);
}

.app-main--flush {
  padding: 0;
  min-height: 100vh;
}
</style>
