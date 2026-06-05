<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isRegister = ref(false)
const email = ref('')
const password = ref('')
const displayName = ref('')
const householdName = ref('')

async function submit() {
  try {
    const trimmedEmail = email.value.trim()
    const trimmedPassword = password.value
    if (isRegister.value) {
      const trimmedName = displayName.value.trim()
      const trimmedHousehold = householdName.value.trim()
      if (!trimmedName) {
        auth.error = 'Please enter your name'
        return
      }
      await auth.register({
        email: trimmedEmail,
        password: trimmedPassword,
        displayName: trimmedName,
        householdName: trimmedHousehold || undefined,
      })
    } else {
      await auth.login(trimmedEmail, trimmedPassword)
    }
    router.push('/lists')
  } catch {
    /* error shown via store */
  }
}

onMounted(() => {
  if (route.query.register === '1') {
    isRegister.value = true
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>🧅 The Last Onion</h1>
      <p class="subtitle">Shared grocery lists for your household</p>

      <form @submit.prevent="submit">
        <div v-if="isRegister" class="field">
          <label for="displayName">Your name</label>
          <input id="displayName" v-model="displayName" required />
        </div>
        <div v-if="isRegister" class="field">
          <label for="householdName">Household name</label>
          <input id="householdName" v-model="householdName" placeholder="Optional" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            autocomplete="current-password"
          />
        </div>

        <p v-if="auth.error" class="error">{{ auth.error }}</p>

        <button type="submit" class="btn-primary" :disabled="auth.loading">
          {{ auth.loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in' }}
        </button>
      </form>

      <button type="button" class="btn-link" @click="isRegister = !isRegister">
        {{ isRegister ? 'Already have an account? Sign in' : 'Need an account? Register' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
}

.subtitle {
  color: var(--muted);
  margin: 0 0 1.5rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.field input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.error {
  color: var(--danger);
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.btn-link {
  display: block;
  width: 100%;
  margin-top: 1rem;
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
