<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useCategoryLabel } from '@/composables/useCategoryLabel'

const auth = useAuthStore()
const categoriesStore = useCategoriesStore()
const { getCategoryLabel } = useCategoryLabel()

const newCategory = ref('')
const editingId = ref<string | null>(null)
const editingName = ref('')

onMounted(async () => {
  if (auth.activeHousehold) {
    await categoriesStore.fetchCategories(auth.activeHousehold.id)
  }
})

async function addCategory() {
  if (!auth.activeHousehold || !newCategory.value.trim()) return
  await categoriesStore.createCategory(auth.activeHousehold.id, newCategory.value.trim())
  newCategory.value = ''
}

function startEdit(id: string, name: string) {
  editingId.value = id
  editingName.value = name
}

async function saveEdit() {
  if (!editingId.value || !editingName.value.trim()) return
  await categoriesStore.updateCategory(editingId.value, editingName.value.trim())
  editingId.value = null
}

async function deleteCategory(id: string, label: string) {
  if (confirm(`Delete "${label}"? Items will move to Other.`)) {
    await categoriesStore.deleteCategory(id)
  }
}

async function moveUp(index: number) {
  if (!auth.activeHousehold || index === 0) return
  const ids = categoriesStore.categories.map((c) => c.id)
  ;[ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!]
  await categoriesStore.reorderCategories(auth.activeHousehold.id, ids)
}

async function moveDown(index: number) {
  if (!auth.activeHousehold || index >= categoriesStore.categories.length - 1) return
  const ids = categoriesStore.categories.map((c) => c.id)
  ;[ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!]
  await categoriesStore.reorderCategories(auth.activeHousehold.id, ids)
}
</script>

<template>
  <div class="categories-page">
    <h1>Categories</h1>
    <p class="desc">Customize how items are grouped on your shopping lists.</p>

    <form class="add-form" @submit.prevent="addCategory">
      <input v-model="newCategory" placeholder="New category name" />
      <button type="submit">Add</button>
    </form>

    <ul class="category-list">
      <li v-for="(cat, index) in categoriesStore.categories" :key="cat.id">
        <template v-if="editingId === cat.id">
          <input v-model="editingName" class="edit-input" @keyup.enter="saveEdit" />
          <button type="button" @click="saveEdit">Save</button>
        </template>
        <template v-else>
          <span class="cat-name">{{ getCategoryLabel(cat) }}</span>
          <div class="actions">
            <button type="button" :disabled="index === 0" @click="moveUp(index)">↑</button>
            <button
              type="button"
              :disabled="index === categoriesStore.categories.length - 1"
              @click="moveDown(index)"
            >
              ↓
            </button>
            <button v-if="!cat.key" type="button" @click="startEdit(cat.id, cat.name)">
              Edit
            </button>
            <button
              v-if="cat.key !== 'other'"
              type="button"
              class="danger"
              @click="deleteCategory(cat.id, getCategoryLabel(cat))"
            >
              Delete
            </button>
          </div>
        </template>
      </li>
    </ul>

    <RouterLink to="/settings" class="back">← Back to settings</RouterLink>
  </div>
</template>

<style scoped>
.categories-page {
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
  font-size: 16px;
}

.add-form button {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.cat-name {
  font-weight: 500;
}

.edit-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.actions button {
  padding: 0.25rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.actions button:disabled {
  opacity: 0.4;
}

.actions button.danger {
  color: var(--danger);
}

.back {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
}
</style>
