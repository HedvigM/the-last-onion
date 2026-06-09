const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch (e) {
    if (e instanceof TypeError) {
      throw new ApiError('No internet connection', 0)
    }
    throw e
  }
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : 'Request failed'
    throw new ApiError(message, res.status)
  }
  return data as T
}

export const api = {
  register(body: { email: string; password: string; displayName: string; householdName?: string }) {
    return request<{ token: string; user: import('@/types').User; household: import('@/types').Household }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
  },

  login(body: { email: string; password: string }) {
    return request<{ token: string; user: import('@/types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  me() {
    return request<{ user: import('@/types').User; households: import('@/types').Household[] }>(
      '/auth/me',
    )
  },

  updateLanguage(language: import('@/types').AppLanguage) {
    return request<{ user: import('@/types').User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ language }),
    })
  },

  getHouseholds() {
    return request<import('@/types').HouseholdDetail[]>('/households')
  },

  createHousehold(name: string) {
    return request<import('@/types').Household>('/households', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  inviteToHousehold(householdId: string, email: string) {
    return request<{ token: string; expiresAt: string }>(
      `/households/${householdId}/invite`,
      { method: 'POST', body: JSON.stringify({ email }) },
    )
  },

  getInvite(token: string) {
    return request<import('@/types').InvitePreview>(`/invites/${token}`)
  },

  acceptInvite(token: string) {
    return request<import('@/types').AcceptInviteResult>(`/invites/${token}/accept`, {
      method: 'POST',
    })
  },

  getLists(householdId: string) {
    return request<import('@/types').GroceryList[]>(`/households/${householdId}/lists`)
  },

  createList(householdId: string, name: string) {
    return request<import('@/types').GroceryList>(`/households/${householdId}/lists`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  getList(listId: string) {
    return request<import('@/types').GroceryList>(`/lists/${listId}`)
  },

  updateList(listId: string, name: string) {
    return request<{ id: string; name: string }>(`/lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
  },

  deleteList(listId: string) {
    return request<{ success: boolean }>(`/lists/${listId}`, { method: 'DELETE' })
  },

  addItem(listId: string, name: string, categoryId?: string) {
    return request<import('@/types').ListItem & { action?: string }>(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ name, categoryId }),
    })
  },

  updateItem(listId: string, itemId: string, data: { checked?: boolean; categoryId?: string }) {
    return request<import('@/types').ListItem>(`/lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteItem(listId: string, itemId: string) {
    return request<{ success: boolean }>(`/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    })
  },

  addUsualItems(listId: string) {
    return request<{ added: import('@/types').ListItem[] }>(`/lists/${listId}/add-usual`, {
      method: 'POST',
    })
  },

  inviteToList(listId: string, email: string) {
    return request<{ token: string; expiresAt: string }>(`/lists/${listId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  getCategories(householdId: string) {
    return request<import('@/types').Category[]>(`/households/${householdId}/categories`)
  },

  createCategory(householdId: string, name: string) {
    return request<import('@/types').Category>(`/households/${householdId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  updateCategory(categoryId: string, name: string) {
    return request<import('@/types').Category>(`/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
  },

  deleteCategory(categoryId: string) {
    return request<{ success: boolean }>(`/categories/${categoryId}`, { method: 'DELETE' })
  },

  reorderCategories(householdId: string, categoryIds: string[]) {
    return request<{ success: boolean }>(`/households/${householdId}/categories/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ categoryIds }),
    })
  },

  getUsualItems(householdId: string) {
    return request<import('@/types').UsualItem[]>(`/households/${householdId}/usual-items`)
  },

  pinUsualItem(householdId: string, data: { name?: string; catalogItemId?: string }) {
    return request<import('@/types').UsualItem>(`/households/${householdId}/usual-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  unpinUsualItem(householdId: string, catalogItemId: string) {
    return request<{ success: boolean }>(
      `/households/${householdId}/usual-items/${catalogItemId}`,
      { method: 'DELETE' },
    )
  },
}

export { ApiError, getToken }
