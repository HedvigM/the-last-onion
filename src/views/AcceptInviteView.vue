<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { api } from '@/api/client'
import type { InvitePreview } from '@/types'

const auth = useAuthStore()
const listsStore = useListsStore()
const router = useRouter()
const route = useRoute()

const token = computed(() => route.params.token as string)
const invite = ref<InvitePreview | null>(null)
const loading = ref(true)
const accepting = ref(false)
const error = ref<string | null>(null)

const isLoggedIn = computed(() => auth.isAuthenticated)

const emailMismatch = computed(() => {
  if (!invite.value || !auth.user) return false
  return auth.user.email.toLowerCase() !== invite.value.email.toLowerCase()
})

const inviteSummary = computed(() => {
  if (!invite.value?.targetName) return null
  if (invite.value.type === 'list') {
    return `${invite.value.invitedBy} invited you to collaborate on "${invite.value.targetName}"`
  }
  return `${invite.value.invitedBy} invited you to join "${invite.value.targetName}"`
})

const loginUrl = computed(() => ({
  path: '/login',
  query: { redirect: route.fullPath },
}))

const registerUrl = computed(() => ({
  path: '/login',
  query: { redirect: route.fullPath, register: '1' },
}))

onMounted(async () => {
  await loadInvite()
})

async function loadInvite() {
  loading.value = true
  error.value = null
  try {
    invite.value = await api.getInvite(token.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load invite'
  } finally {
    loading.value = false
  }
}

async function handleAccept() {
  accepting.value = true
  error.value = null
  try {
    const result = await auth.acceptInvite(token.value)

    if (result.type === 'list' && result.listId) {
      if (auth.activeHousehold) {
        await listsStore.fetchLists(auth.activeHousehold.id)
      }
      router.push(`/lists/${result.listId}`)
    } else if (result.type === 'household' && result.householdId) {
      auth.setActiveHousehold(result.householdId)
      await listsStore.fetchLists(result.householdId)
      router.push('/lists')
    } else {
      router.push('/lists')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to accept invite'
  } finally {
    accepting.value = false
  }
}

function goToTarget() {
  if (!invite.value) return
  if (invite.value.type === 'list' && invite.value.listId) {
    router.push(`/lists/${invite.value.listId}`)
  } else {
    if (invite.value.householdId) {
      auth.setActiveHousehold(invite.value.householdId)
    }
    router.push('/lists')
  }
}
</script>

<template>
  <div class="accept-page">
    <div v-if="loading" class="card">
      <p>Loading invite…</p>
    </div>

    <div v-else-if="error && !invite" class="card">
      <h1>Invite not found</h1>
      <p class="muted">{{ error }}</p>
      <RouterLink to="/lists" class="btn-secondary">Go to lists</RouterLink>
    </div>

    <div v-else-if="invite" class="card">
      <h1>You're invited!</h1>

      <p v-if="invite.status === 'expired'" class="error">
        This invite has expired. Ask {{ invite.invitedBy }} to send a new link.
      </p>

      <p v-else-if="invite.status === 'accepted' && !invite.alreadyMember" class="error">
        This invite has already been used.
      </p>

      <template v-else>
        <p v-if="inviteSummary" class="summary">{{ inviteSummary }}</p>

        <p v-if="invite.type === 'list'" class="muted detail">
          You'll be able to add and check off items on this shared list. It stays separate from
          your own household lists.
        </p>
        <p v-else class="muted detail">
          You'll join this household and see all of its grocery lists.
        </p>

        <p v-if="emailMismatch" class="warning">
          This invite was sent to <strong>{{ invite.email }}</strong>. You're signed in as
          <strong>{{ auth.user?.email }}</strong>. You can still accept, but make sure this is the
          account you want to use.
        </p>

        <p v-if="error" class="error">{{ error }}</p>

        <template v-if="invite.alreadyMember">
          <p class="success">You're already on this {{ invite.type === 'list' ? 'list' : 'household' }}.</p>
          <button type="button" class="btn-primary" @click="goToTarget">
            Go to {{ invite.type === 'list' ? 'list' : 'household lists' }}
          </button>
        </template>

        <template v-else-if="invite.status === 'valid'">
          <template v-if="!isLoggedIn">
            <p class="muted">Sign in or create an account to accept.</p>
            <div class="actions">
              <RouterLink :to="loginUrl" class="btn-primary">Sign in</RouterLink>
              <RouterLink :to="registerUrl" class="btn-secondary">Create account</RouterLink>
            </div>
          </template>

          <template v-else>
            <button
              type="button"
              class="btn-primary"
              :disabled="accepting"
              @click="handleAccept"
            >
              {{ accepting ? 'Accepting…' : 'Accept invite' }}
            </button>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.accept-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.card {
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

h1 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.summary {
  font-size: 1.05rem;
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.muted {
  color: var(--muted);
  font-size: 0.875rem;
}

.detail {
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.warning {
  background: #fff3cd;
  color: #664d03;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.success {
  color: var(--primary);
  margin: 0 0 1rem;
}

.error {
  color: var(--danger);
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
  display: block;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.btn-secondary {
  background: var(--surface);
  border: 1px solid var(--border);
  color: inherit;
}
</style>
