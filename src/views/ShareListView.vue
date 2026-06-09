<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { api } from '@/api/client'
import { translateApiError } from '@/composables/useApiError'

const route = useRoute()
const auth = useAuthStore()
const listsStore = useListsStore()
const { t } = useI18n()

const listId = route.params.id as string
const email = ref('')
const inviteToken = ref<string | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

onMounted(() => {
  if (!listsStore.currentList) {
    listsStore.fetchList(listId)
  }
})

async function sendInvite() {
  if (!email.value.trim()) return
  loading.value = true
  error.value = null
  try {
    const res = await api.inviteToList(listId, email.value.trim())
    inviteToken.value = res.token
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to send invite'
    error.value = translateApiError(message, t)
  } finally {
    loading.value = false
  }
}

function inviteLink() {
  if (!inviteToken.value) return ''
  return `${window.location.origin}/invite/${inviteToken.value}`
}

async function copyLink() {
  if (inviteLink()) {
    await navigator.clipboard.writeText(inviteLink())
  }
}
</script>

<template>
  <div class="share-page">
    <RouterLink :to="`/lists/${listId}`" class="back">{{ t('share.back') }}</RouterLink>
    <h1>{{ t('share.title', { name: listsStore.currentList?.name ?? '' }) }}</h1>
    <p class="desc">{{ t('share.desc') }}</p>

    <form @submit.prevent="sendInvite">
      <div class="field">
        <label for="email">{{ t('share.emailAddress') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          :placeholder="t('share.emailPlaceholder')"
        />
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? t('share.creatingInvite') : t('share.createInviteLink') }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="inviteToken" class="invite-result">
      <p>{{ t('share.shareWith', { email }) }}</p>
      <code class="link">{{ inviteLink() }}</code>
      <button type="button" class="btn-secondary" @click="copyLink">{{ t('common.copyLink') }}</button>
      <p class="invite-hint">{{ t('share.inviteHint') }}</p>
    </div>

    <hr />

    <h2>{{ t('share.householdMembers') }}</h2>
    <p class="desc">
      {{ t('share.householdMembersDesc', { name: auth.activeHousehold?.name ?? '' }) }}
    </p>
    <RouterLink to="/settings" class="btn-secondary inline">{{ t('share.manageHousehold') }}</RouterLink>
  </div>
</template>

<style scoped>
.share-page {
  max-width: 500px;
  margin: 0 auto;
}

.back {
  font-size: 0.875rem;
  color: var(--primary);
  text-decoration: none;
}

h1 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

h2 {
  font-size: 1.125rem;
  margin: 1rem 0 0.5rem;
}

.desc {
  color: var(--muted);
  font-size: 0.875rem;
}

.field {
  margin: 1rem 0;
}

.field label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.field input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: var(--surface);
  border: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary.inline {
  margin-top: 0.5rem;
}

.error {
  color: var(--danger);
  font-size: 0.875rem;
}

.invite-result {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.link {
  display: block;
  word-break: break-all;
  font-size: 0.8rem;
  padding: 0.5rem;
  background: var(--bg);
  border-radius: 4px;
  margin: 0.5rem 0;
}

.invite-hint {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.4;
}

hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}
</style>
