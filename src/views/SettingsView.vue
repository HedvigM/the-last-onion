<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePwaInstall } from '@/composables/usePwaInstall'
import { api } from '@/api/client'
import type { HouseholdDetail } from '@/types'

const auth = useAuthStore()
const router = useRouter()
const { canInstall, isIos, install } = usePwaInstall()

const households = ref<HouseholdDetail[]>([])
const inviteEmail = ref('')
const inviteToken = ref<string | null>(null)
const loading = ref(false)

onMounted(async () => {
  households.value = await api.getHouseholds()
})

async function inviteMember() {
  if (!auth.activeHousehold || !inviteEmail.value.trim()) return
  loading.value = true
  try {
    const res = await api.inviteToHousehold(auth.activeHousehold.id, inviteEmail.value.trim())
    inviteToken.value = res.token
  } finally {
    loading.value = false
  }
}

function inviteLink() {
  if (!inviteToken.value) return ''
  return `${window.location.origin}/invite/${inviteToken.value}`
}

async function copyLink() {
  if (inviteLink()) await navigator.clipboard.writeText(inviteLink())
}
</script>

<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <section v-if="auth.activeHousehold" class="section">
      <h2>{{ auth.activeHousehold.name }}</h2>
      <ul class="members">
        <li
          v-for="member in households.find((h) => h.id === auth.activeHousehold?.id)?.members ??
          []"
          :key="member.userId"
        >
          {{ member.displayName }}
          <span class="role">{{ member.role }}</span>
        </li>
      </ul>

      <h3>Invite to household</h3>
      <form @submit.prevent="inviteMember">
        <input v-model="inviteEmail" type="email" placeholder="Email" required />
        <button type="submit" :disabled="loading">Invite</button>
      </form>
      <div v-if="inviteToken" class="invite-box">
        <code>{{ inviteLink() }}</code>
        <button type="button" @click="copyLink">Copy</button>
      </div>
    </section>

    <section class="section links">
      <RouterLink to="/settings/categories">Edit categories</RouterLink>
      <RouterLink to="/settings/usual-items">Edit usual items</RouterLink>
    </section>

    <section class="section">
      <h3>Install app</h3>
      <p v-if="canInstall" class="install-hint">
        Add The Last Onion to your home screen for quick access while shopping.
      </p>
      <p v-else-if="isIos" class="install-hint">
        Tap Share, then "Add to Home Screen" in Safari.
      </p>
      <p v-else class="install-hint">
        Open this site in Chrome on your phone and use "Add to Home Screen" or "Install app".
      </p>
      <button v-if="canInstall" type="button" class="install-btn" @click="install">
        Install app
      </button>
    </section>

    <section v-if="auth.households.length > 1" class="section">
      <h3>Switch household</h3>
      <button
        v-for="hh in auth.households"
        :key="hh.id"
        type="button"
        class="household-btn"
        :class="{ active: hh.id === auth.activeHouseholdId }"
        @click="auth.setActiveHousehold(hh.id)"
      >
        {{ hh.name }}
      </button>
    </section>

    <button type="button" class="logout" @click="auth.logout(); router.push('/login')">
      Sign out
    </button>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
}

.section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.125rem;
  margin: 0 0 0.75rem;
}

h3 {
  font-size: 1rem;
  margin: 1rem 0 0.5rem;
}

.members {
  list-style: none;
  padding: 0;
  margin: 0;
}

.members li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

.role {
  color: var(--muted);
  font-size: 0.875rem;
  text-transform: capitalize;
}

form {
  display: flex;
  gap: 0.5rem;
}

form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
}

form button {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.invite-box {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: 8px;
}

.invite-box code {
  display: block;
  word-break: break-all;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.links a {
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
}

.household-btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.household-btn.active {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, var(--surface));
}

.logout {
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.install-hint {
  margin: 0 0 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.4;
}

.install-btn {
  padding: 0.75rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
</style>
