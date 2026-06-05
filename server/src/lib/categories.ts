export const DEFAULT_CATEGORY_KEYS = [
  'vegetables',
  'fruits',
  'dairy',
  'meat_fish',
  'baking',
  'pantry',
  'frozen',
  'beverages',
  'household',
  'other',
] as const

export type CategoryKey = (typeof DEFAULT_CATEGORY_KEYS)[number]

export const CATEGORY_KEY_LABELS: Record<CategoryKey, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  dairy: 'Dairy',
  meat_fish: 'Meat & Fish',
  baking: 'Baking',
  pantry: 'Pantry',
  frozen: 'Frozen',
  beverages: 'Beverages',
  household: 'Household',
  other: 'Other',
}

/** Keyword → category key mapping for auto-assignment. */
export const CATEGORY_KEYWORDS: Record<CategoryKey, string[]> = {
  vegetables: [
    'carrot',
    'onion',
    'potato',
    'tomato',
    'lettuce',
    'spinach',
    'broccoli',
    'cucumber',
    'pepper',
    'garlic',
    'celery',
    'mushroom',
    'zucchini',
    'cabbage',
    'kale',
    'avocado',
  ],
  fruits: [
    'apple',
    'banana',
    'orange',
    'lemon',
    'lime',
    'berry',
    'strawberry',
    'blueberry',
    'grape',
    'melon',
    'mango',
    'pear',
    'peach',
    'pineapple',
  ],
  dairy: [
    'milk',
    'cheese',
    'butter',
    'yogurt',
    'cream',
    'egg',
    'cottage',
    'mozzarella',
    'cheddar',
    'parmesan',
  ],
  meat_fish: [
    'chicken',
    'beef',
    'pork',
    'salmon',
    'fish',
    'turkey',
    'bacon',
    'sausage',
    'ham',
    'steak',
    'shrimp',
    'tuna',
  ],
  baking: [
    'flour',
    'sugar',
    'yeast',
    'baking',
    'vanilla',
    'cocoa',
    'chocolate',
    'icing',
    'sprinkle',
  ],
  pantry: [
    'rice',
    'pasta',
    'oil',
    'vinegar',
    'salt',
    'peppercorn',
    'spice',
    'bean',
    'lentil',
    'cereal',
    'oat',
    'nut',
    'honey',
    'jam',
    'sauce',
    'stock',
    'broth',
    'can',
    'soup',
  ],
  frozen: ['frozen', 'ice cream', 'pizza'],
  beverages: [
    'water',
    'juice',
    'coffee',
    'tea',
    'soda',
    'beer',
    'wine',
    'drink',
    'lemonade',
  ],
  household: [
    'soap',
    'shampoo',
    'detergent',
    'toilet',
    'paper',
    'tissue',
    'trash',
    'bag',
    'sponge',
    'cleaner',
  ],
  other: [],
}

export function guessCategoryKey(itemName: string): CategoryKey {
  const normalized = itemName.toLowerCase()
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryKey, string[]][]) {
    if (key === 'other') continue
    if (keywords.some((kw) => normalized.includes(kw))) {
      return key
    }
  }
  return 'other'
}

export const USUAL_ITEM_THRESHOLD = 3
export const USUAL_ITEM_WINDOW_DAYS = 28

export function formatCategory(category: {
  id: string
  key: string | null
  name: string
  sortOrder: number
}) {
  return {
    id: category.id,
    key: category.key,
    name: category.name,
    sortOrder: category.sortOrder,
  }
}
