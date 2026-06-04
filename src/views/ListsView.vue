<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const auth = useAuthStore()
const listsStore = useListsStore()
const router = useRouter()

const newListName = ref('')
const showCreate = ref(false)

onMounted(async () => {
  if (auth.activeHousehold) {
    await listsStore.fetchLists(auth.activeHousehold.id)
  }
})

async function createList() {
  if (!auth.activeHousehold || !newListName.value.trim()) return
  const list = await listsStore.createList(auth.activeHousehold.id, newListName.value.trim())
  newListName.value = ''
  showCreate.value = false
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
      <button type="button" class="btn-primary" @click="showCreate = !showCreate">
        + New list
      </button>
    </header>

    <form v-if="showCreate" class="create-form" @submit.prevent="createList">
      <input v-model="newListName" placeholder="List name" required autofocus />
      <button type="submit">Create</button>
    </form>

    <div v-if="listsStore.loading" class="loading">Loading lists…</div>

    <ul v-else-if="listsStore.lists.length" class="list-cards">
      <li v-for="list in listsStore.lists" :key="list.id">
        <RouterLink :to="`/lists/${list.id}`" class="list-card">
          <span class="list-name">{{ list.name }}</span>
          <span class="list-count">{{ list.uncheckedCount ?? 0 }} items</span>
        </RouterLink>
      </li>
    </ul>

    <p v-else class="empty">No lists yet. Create one to start shopping!</p>
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

.create-form button {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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

.list-name {
  font-weight: 500;
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
