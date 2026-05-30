import type { PrismaClient } from '@prisma/client'
import { DEFAULT_CATEGORIES } from './categories.js'

export async function seedDefaultCategories(
  prisma: PrismaClient,
  householdId: string,
): Promise<void> {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((name, index) => ({
      householdId,
      name,
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
    where: { householdId, name: 'Other' },
  })
  if (!other) {
    throw new Error('Other category not found for household')
  }
  return other.id
}
