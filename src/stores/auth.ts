import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, setToken, getToken } from '@/api/client'
import { setAppLocale, getStoredLocale, getCurrentLocale } from '@/i18n'
import { i18n } from '@/i18n'
import { translateApiError } from '@/composables/useApiError'
import { clearPendingInvite } from '@/composables/usePendingInvite'
import type { AppLanguage, User, Household } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const households = ref<Household[]>([])
  const activeHouseholdId = ref<string | null>(localStorage.getItem('activeHouseholdId'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  let fetchMeInFlight: Promise<void> | null = null

  const isAuthenticated = computed(() => !!user.value)
  const activeHousehold = computed(
    () => households.value.find((h) => h.id === activeHouseholdId.value) ?? households.value[0] ?? null,
  )

  function applyUserLanguage(language: AppLanguage) {
    setAppLocale(language)
  }

  function setActiveHousehold(id: string) {
    activeHouseholdId.value = id
    localStorage.setItem('activeHouseholdId', id)
  }

  function setError(message: string) {
    error.value = translateApiError(message, (key) => i18n.global.t(key))
  }

  function applySession(nextUser: User, nextHouseholds: Household[]) {
    user.value = nextUser
    households.value = nextHouseholds
    applyUserLanguage(nextUser.language)
    if (nextHouseholds.length && !activeHouseholdId.value) {
      setActiveHousehold(nextHouseholds[0]!.id)
    }
  }

  async function register(data: {
    email: string
    password: string
    displayName: string
    householdName?: string
    language?: AppLanguage
  }) {
    loading.value = true
    error.value = null
    try {
      const res = await api.register({
        ...data,
        language: data.language ?? getCurrentLocale(),
      })
      setToken(res.token)
      applySession(res.user, [res.household])
      setActiveHousehold(res.household.id)
      return res
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await api.login({ email, password })
      setToken(res.token)
      applySession(res.user, res.households)
      return res
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!getToken()) return
    if (fetchMeInFlight) return fetchMeInFlight

    loading.value = true
    fetchMeInFlight = (async () => {
      try {
        const res = await api.me()
        applySession(res.user, res.households)
      } catch {
        logout()
      } finally {
        loading.value = false
        fetchMeInFlight = null
      }
    })()

    return fetchMeInFlight
  }

  /** Restore session if a token exists; resolves when user is loaded or auth cleared. */
  async function ensureSession() {
    if (user.value) return
    if (!getToken()) return
    await fetchMe()
  }

  async function updateLanguage(language: AppLanguage) {
    const res = await api.updateLanguage(language)
    user.value = res.user
    applyUserLanguage(res.user.language)
  }

  function logout() {
    fetchMeInFlight = null
    setToken(null)
    user.value = null
    households.value = []
    activeHouseholdId.value = null
    localStorage.removeItem('activeHouseholdId')
    clearPendingInvite()
    applyUserLanguage(getStoredLocale() ?? 'en')
  }

  async function acceptInvite(token: string) {
    const result = await api.acceptInvite(token)
    await fetchMe()
    return result
  }

  return {
    user,
    households,
    activeHouseholdId,
    activeHousehold,
    loading,
    error,
    isAuthenticated,
    setActiveHousehold,
    register,
    login,
    fetchMe,
    ensureSession,
    updateLanguage,
    logout,
    acceptInvite,
  }
})
