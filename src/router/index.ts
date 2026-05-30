import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      redirect: '/lists',
    },
    {
      path: '/lists',
      name: 'lists',
      component: () => import('../views/ListsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lists/:id',
      name: 'list-detail',
      component: () => import('../views/ListDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lists/:id/share',
      name: 'share-list',
      component: () => import('../views/ShareListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/categories',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/usual-items',
      name: 'usual-items',
      component: () => import('../views/UsualItemsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invite/:token',
      name: 'accept-invite',
      component: () => import('../views/AcceptInviteView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const hasToken = !!getToken()

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && hasToken) {
    return { name: 'lists' }
  }

  if (hasToken && to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.user) {
      await auth.fetchMe()
    }
  }
})

export default router
