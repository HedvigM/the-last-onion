<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const token = route.params.token as string
  if (!auth.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await auth.acceptInvite(token)
    router.push('/lists')
  } catch {
    router.push('/lists')
  }
})
</script>

<template>
  <div class="accept-page">
    <p>Accepting invite…</p>
  </div>
</template>

<style scoped>
.accept-page {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
}
</style>
