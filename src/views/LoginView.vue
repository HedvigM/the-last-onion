<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api/client'
import LanguageToggle from '@/components/LanguageToggle.vue'
import {
  getPendingInvite,
  getPendingInvitePath,
  setPendingInvite,
  parseInviteTokenFromPath,
  isSafeRedirect,
} from '@/composables/usePendingInvite'
import type { InvitePreview } from '@/types'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const isRegister = ref(false)
const email = ref('')
const password = ref('')
const displayName = ref('')
const householdName = ref('')
const invitePreview = ref<InvitePreview | null>(null)

const inviteBanner = computed(() => {
  if (!invitePreview.value?.targetName) return null
  if (invitePreview.value.type === 'list') {
    return t('invite.summaryList', {
      invitedBy: invitePreview.value.invitedBy,
      targetName: invitePreview.value.targetName,
    })
  }
  return t('invite.summaryHousehold', {
    invitedBy: invitePreview.value.invitedBy,
    targetName: invitePreview.value.targetName,
  })
})

function resolvePostAuthRedirect(): string {
  const queryRedirect =
    typeof route.query.redirect === 'string' && isSafeRedirect(route.query.redirect)
      ? route.query.redirect
      : null
  return queryRedirect ?? getPendingInvitePath() ?? '/lists'
}

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
    router.push(resolvePostAuthRedirect())
  } catch {
    /* error shown via store */
  }
}

async function loadInvitePreview() {
  const token =
    parseInviteTokenFromPath(
      typeof route.query.redirect === 'string' ? route.query.redirect : '',
    ) ?? getPendingInvite()
  if (!token) return

  try {
    invitePreview.value = await api.getInvite(token)
  } catch {
    invitePreview.value = null
  }
}

onMounted(async () => {
  if (route.query.register === '1') {
    isRegister.value = true
  }

  if (typeof route.query.email === 'string') {
    email.value = route.query.email
  }

  if (typeof route.query.redirect === 'string') {
    const token = parseInviteTokenFromPath(route.query.redirect)
    if (token) {
      setPendingInvite(token)
    }
  }

  await loadInvitePreview()
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

      <p v-if="inviteBanner" class="invite-banner">{{ inviteBanner }}</p>

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
  box-shadow: var(--shadow);
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

.invite-banner {
  background: var(--success-bg);
  color: var(--success-text);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.25rem;
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
  background: var(--bg);
  color: var(--text);
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
