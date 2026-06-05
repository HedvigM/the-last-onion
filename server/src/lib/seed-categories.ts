import type { PrismaClient } from '@prisma/client'
import { CATEGORY_KEY_LABELS, DEFAULT_CATEGORY_KEYS } from './categories.js'

export async function seedDefaultCategories(
  prisma: PrismaClient,
  householdId: string,
): Promise<void> {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORY_KEYS.map((key, index) => ({
      householdId,
      key,
      name: CATEGORY_KEY_LABELS[key],
      sortOrder: index,
    })),
    skipDuplicates: true,
  })
}

export async function getOtherCategoryId(
  prisma: PrismaClient,
  householdId: string,
): Promise<string> {
  const other = await prisma.category.findFirst({
    where: { householdId, key: 'other' },
  })
  if (!other) {
    throw new Error('Other category not found for household')
  }
  return other.id
}
