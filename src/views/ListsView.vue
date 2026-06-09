<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const auth = useAuthStore()
const listsStore = useListsStore()
const router = useRouter()

const newListName = ref('')
const showCreate = ref(false)
const createFormRef = ref<HTMLElement | null>(null)
const newListBtnRef = ref<HTMLElement | null>(null)

const householdLists = computed(() => listsStore.lists.filter((l) => !l.isShared))
const sharedLists = computed(() => listsStore.lists.filter((l) => l.isShared))

onMounted(async () => {
  if (auth.activeHousehold) {
    await listsStore.fetchLists(auth.activeHousehold.id)
  }
})

function cancelCreate() {
  showCreate.value = false
  newListName.value = ''
}

function toggleCreate() {
  if (showCreate.value) {
    cancelCreate()
  } else {
    showCreate.value = true
  }
}

onClickOutside(createFormRef, cancelCreate, { ignore: [newListBtnRef] })

async function createList() {
  if (!auth.activeHousehold || !newListName.value.trim()) return
  const list = await listsStore.createList(auth.activeHousehold.id, newListName.value.trim())
  cancelCreate()
  router.push(`/lists/${list.id}`)
}
</script>

<template>
  <div class="lists-page">
    <header class="page-header">
      <div>
        <h1>Lists</h1>
        <p v-if="auth.activeHousehold" class="subtitle">{{ auth.activeHousehold.name }}</p>
      </div>
      <button ref="newListBtnRef" type="button" class="btn-primary" @click="toggleCreate">
        + New list
      </button>
    </header>

    <form
      v-if="showCreate"
      ref="createFormRef"
      class="create-form"
      @submit.prevent="createList"
      @keydown.esc="cancelCreate"
    >
      <input v-model="newListName" placeholder="List name" required autofocus />
      <button type="submit">Create</button>
      <button type="button" class="btn-cancel" aria-label="Cancel" @click="cancelCreate">
        ×
      </button>
    </form>

    <div v-if="listsStore.loading" class="loading">Loading lists…</div>

    <template v-else>
      <section v-if="householdLists.length" class="list-section">
        <h2 class="section-title">Your lists</h2>
        <ul class="list-cards">
          <li v-for="list in householdLists" :key="list.id">
            <RouterLink :to="`/lists/${list.id}`" class="list-card">
              <span class="list-name">{{ list.name }}</span>
              <span class="list-count">{{ list.uncheckedCount ?? 0 }} items</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="sharedLists.length" class="list-section">
        <h2 class="section-title">Shared with you</h2>
        <p class="section-desc">Lists shared by someone outside your household</p>
        <ul class="list-cards">
          <li v-for="list in sharedLists" :key="list.id">
            <RouterLink :to="`/lists/${list.id}`" class="list-card list-card--shared">
              <div class="list-card-main">
                <span class="list-name">{{ list.name }}</span>
                <span class="shared-badge">Shared</span>
              </div>
              <span class="list-count">{{ list.uncheckedCount ?? 0 }} items</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <p v-if="!householdLists.length && !sharedLists.length" class="empty">
        No lists yet. Create one to start shopping!
      </p>
    </template>
  </div>
</template>

<style scoped>
.lists-page {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.create-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.create-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
}

.create-form button[type='submit'] {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel {
  flex-shrink: 0;
  width: 2.5rem;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.btn-cancel:hover {
  color: var(--text);
  border-color: var(--muted);
}

.list-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin: 0 0 0.5rem;
}

.section-desc {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0 0 0.75rem;
}

.list-cards {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border);
}

.list-card:hover {
  border-color: var(--primary);
}

.list-card--shared {
  border-color: var(--primary);
  border-style: dashed;
}

.list-card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-name {
  font-weight: 500;
}

.shared-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.list-count {
  color: var(--muted);
  font-size: 0.875rem;
}

.loading,
.empty {
  color: var(--muted);
  text-align: center;
  padding: 2rem;
}
</style>
