<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageToggle from '@/components/LanguageToggle.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

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
        auth.error = t('auth.enterName')
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
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/lists'
    router.push(redirect)
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
      <div class="auth-header">
        <h1>{{ t('nav.brand') }}</h1>
        <LanguageToggle />
      </div>
      <p class="subtitle">{{ t('auth.subtitle') }}</p>

      <form @submit.prevent="submit">
        <div v-if="isRegister" class="field">
          <label for="displayName">{{ t('auth.yourName') }}</label>
          <input id="displayName" v-model="displayName" required />
        </div>
        <div v-if="isRegister" class="field">
          <label for="householdName">{{ t('auth.householdName') }}</label>
          <input id="householdName" v-model="householdName" :placeholder="t('common.optional')" />
        </div>
        <div class="field">
          <label for="email">{{ t('common.email') }}</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">{{ t('auth.password') }}</label>
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
          {{
            auth.loading
              ? t('common.pleaseWait')
              : isRegister
                ? t('auth.createAccount')
                : t('auth.signIn')
          }}
        </button>
      </form>

      <button type="button" class="btn-link" @click="isRegister = !isRegister">
        {{ isRegister ? t('auth.alreadyHaveAccount') : t('auth.needAccount') }}
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

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
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
