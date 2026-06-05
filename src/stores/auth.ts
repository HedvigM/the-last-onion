import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, setToken, getToken } from '@/api/client'
import { setAppLocale } from '@/i18n'
import type { AppLanguage, User, Household } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const households = ref<Household[]>([])
  const activeHouseholdId = ref<string | null>(localStorage.getItem('activeHouseholdId'))
  const loading = ref(false)
  const error = ref<string | null>(null)

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
      const res = await api.register(data)
      setToken(res.token)
      user.value = res.user
      households.value = [res.household]
      setActiveHousehold(res.household.id)
      applyUserLanguage(res.user.language)
      return res
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
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
      user.value = res.user
      applyUserLanguage(res.user.language)
      await fetchMe()
      return res
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!getToken()) return
    loading.value = true
    try {
      const res = await api.me()
      user.value = res.user
      households.value = res.households
      applyUserLanguage(res.user.language)
      if (households.value.length && !activeHouseholdId.value) {
        setActiveHousehold(households.value[0]!.id)
      }
    } catch {
      logout()
    } finally {
      loading.value = false
    }
  }

  async function updateLanguage(language: AppLanguage) {
    const res = await api.updateLanguage(language)
    user.value = res.user
    applyUserLanguage(res.user.language)
  }

  function logout() {
    setToken(null)
    user.value = null
    households.value = []
    activeHouseholdId.value = null
    localStorage.removeItem('activeHouseholdId')
    applyUserLanguage('en')
  }

  async function acceptInvite(token: string) {
    await api.acceptInvite(token)
    await fetchMe()
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
    updateLanguage,
    logout,
    acceptInvite,
  }
})
