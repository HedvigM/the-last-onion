import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { getPendingInvitePath, isSafeRedirect } from '@/composables/usePendingInvite'
import AcceptInviteView from '../views/AcceptInviteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue'),
      meta: { guest: true, marketing: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { guest: true, marketing: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
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
      path: '/lists/:id/usual-items',
      name: 'usual-items',
      component: () => import('../views/UsualItemsView.vue'),
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
      path: '/invite/:token',
      name: 'accept-invite',
      component: AcceptInviteView,
    },
  ],
})

router.beforeEach(async (to) => {
  const hasToken = !!getToken()

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && hasToken) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : null
    if (redirect && isSafeRedirect(redirect)) {
      return redirect
    }
    return { name: 'lists' }
  }

  if (hasToken && to.name === 'lists') {
    const pendingInvitePath = getPendingInvitePath()
    if (pendingInvitePath) {
      return pendingInvitePath
    }
  }

  if (hasToken && (to.meta.requiresAuth || to.name === 'accept-invite')) {
    const auth = useAuthStore()
    if (!auth.user) {
      await auth.fetchMe()
    }
    // Invalid/expired token: fetchMe clears the session — send them to login
    if (to.meta.requiresAuth && !auth.user) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
})

export default router
