export interface User {
  id: string
  email: string
  displayName: string
  language: AppLanguage
}

export type AppLanguage = 'en' | 'sv'

export interface Household {
  id: string
  name: string
  role?: 'owner' | 'member'
}

export interface Category {
  id: string
  key: string | null
  name: string
  sortOrder: number
}

export interface ListItem {
  id: string
  listId: string
  checked: boolean
  checkedAt: string | null
  createdAt: string
  catalogItem: {
    id: string
    displayName: string
    normalizedName: string
    categoryId: string
    category: Category
  }
}

export interface GroceryList {
  id: string
  name: string
  householdId: string
  uncheckedCount?: number
  createdAt?: string
  isShared?: boolean
  items?: ListItem[]
}

export interface InvitePreview {
  type: 'household' | 'list'
  invitedBy: string
  targetName: string | undefined
  email: string
  status: 'valid' | 'expired' | 'accepted'
  alreadyMember: boolean
  listId: string | null
  householdId: string | null
}

export interface AcceptInviteResult {
  success: boolean
  type: 'household' | 'list'
  listId: string | null
  householdId: string | null
  name: string | undefined
}

export interface UsualItem {
  catalogItemId: string
  displayName: string
  categoryId: string
  categoryKey: string | null
  categoryName: string
  isManual: boolean
  purchaseCount: number
}

export interface HouseholdMember {
  userId: string
  email: string
  displayName: string
  role: string
}

export interface HouseholdDetail extends Household {
  members: HouseholdMember[]
}
