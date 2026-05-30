<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'

const auth = useAuthStore()
const categoriesStore = useCategoriesStore()

const newItemName = ref('')

onMounted(async () => {
  if (auth.activeHousehold) {
    await categoriesStore.fetchUsualItems(auth.activeHousehold.id)
  }
})

async function pinItem() {
  if (!auth.activeHousehold || !newItemName.value.trim()) return
  await categoriesStore.pinUsualItem(auth.activeHousehold.id, newItemName.value.trim())
  newItemName.value = ''
}

async function unpin(catalogItemId: string) {
  if (!auth.activeHousehold) return
  await categoriesStore.unpinUsualItem(auth.activeHousehold.id, catalogItemId)
}
</script>

<template>
  <div class="usual-page">
    <h1>Usual items</h1>
    <p class="desc">
      Items you buy often appear here automatically (3+ times in 28 days). You can also pin items
      manually.
    </p>

    <form class="add-form" @submit.prevent="pinItem">
      <input v-model="newItemName" placeholder="Pin an item…" />
      <button type="submit">Pin</button>
    </form>

    <ul v-if="categoriesStore.usualItems.length" class="usual-list">
      <li v-for="item in categoriesStore.usualItems" :key="item.catalogItemId">
        <div class="item-info">
          <span class="name">{{ item.displayName }}</span>
          <span class="meta">
            {{ item.categoryName }}
            ·
            <span v-if="item.isManual">Pinned</span>
            <span v-else>{{ item.purchaseCount }}× recently</span>
          </span>
        </div>
        <button
          v-if="item.isManual"
          type="button"
          class="unpin"
          @click="unpin(item.catalogItemId)"
        >
          Unpin
        </button>
      </li>
    </ul>

    <p v-else class="empty">No usual items yet. Shop a few times or pin items manually.</p>

    <RouterLink to="/settings" class="back">← Back to settings</RouterLink>
  </div>
</template>

<style scoped>
.usual-page {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 0.25rem;
}

.desc {
  color: var(--muted);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.add-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.add-form button {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.usual-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.usual-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.name {
  font-weight: 500;
  display: block;
}

.meta {
  font-size: 0.75rem;
  color: var(--muted);
}

.unpin {
  padding: 0.25rem 0.75rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.empty {
  color: var(--muted);
  text-align: center;
  padding: 2rem;
}

.back {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
}
</style>
