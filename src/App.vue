<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()

const showNav = computed(
  () => auth.isAuthenticated && !route.meta.guest && route.name !== 'list-detail',
)

onMounted(async () => {
  if (localStorage.getItem('token')) {
    await auth.fetchMe()
  }
})
</script>

<template>
  <div id="app-root">
    <nav v-if="showNav" class="app-nav">
      <RouterLink to="/lists" class="brand">🧅 The Last Onion</RouterLink>
      <div class="nav-links">
        <RouterLink to="/lists">Lists</RouterLink>
        <RouterLink to="/settings">Settings</RouterLink>
      </div>
    </nav>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
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
  min-height: calc(100vh - 52px);
}
</style>
