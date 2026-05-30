export interface User {
  id: string
  email: string
  displayName: string
}

export interface Household {
  id: string
  name: string
  role?: 'owner' | 'member'
}

export interface Category {
  id: string
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
  items?: ListItem[]
}

export interface UsualItem {
  catalogItemId: string
  displayName: string
  categoryId: string
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
