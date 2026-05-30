import type { PrismaClient } from '@prisma/client'
import { guessCategoryName } from '../lib/categories.js'
import { displayItemName, normalizeItemName } from '../lib/normalize.js'

export async function findOrCreateCatalogItem(
  prisma: PrismaClient,
  householdId: string,
  rawName: string,
  categoryIdOverride?: string,
) {
  const normalizedName = normalizeItemName(rawName)
  const displayName = displayItemName(rawName)

  const existing = await prisma.catalogItem.findUnique({
    where: { householdId_normalizedName: { householdId, normalizedName } },
    include: { category: true },
  })
  if (existing) return existing

  let categoryId = categoryIdOverride
  if (!categoryId) {
    const categoryName = guessCategoryName(rawName)
    const category = await prisma.category.findFirst({
      where: { householdId, name: categoryName },
    })
    if (!category) {
      const other = await prisma.category.findFirst({
        where: { householdId, name: 'Other' },
      })
      if (!other) throw new Error('No categories for household')
      categoryId = other.id
    } else {
      categoryId = category.id
    }
  }

  return prisma.catalogItem.create({
    data: {
      householdId,
      normalizedName,
      displayName,
      categoryId,
    },
    include: { category: true },
  })
}

export type ListItemWithCatalog = Awaited<ReturnType<typeof getListItems>>[number]

export async function getListItems(prisma: PrismaClient, listId: string) {
  return prisma.listItem.findMany({
    where: { listId },
    include: {
      catalogItem: { include: { category: true } },
    },
    orderBy: [{ checked: 'asc' }, { checkedAt: 'desc' }, { createdAt: 'asc' }],
  })
}

export function formatListItem(item: ListItemWithCatalog) {
  return {
    id: item.id,
    listId: item.listId,
    checked: item.checked,
    checkedAt: item.checkedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    catalogItem: {
      id: item.catalogItem.id,
      displayName: item.catalogItem.displayName,
      normalizedName: item.catalogItem.normalizedName,
      categoryId: item.catalogItem.categoryId,
      category: {
        id: item.catalogItem.category.id,
        name: item.catalogItem.category.name,
        sortOrder: item.catalogItem.category.sortOrder,
      },
    },
  }
}

export async function addItemToList(
  prisma: PrismaClient,
  listId: string,
  householdId: string,
  rawName: string,
  categoryId?: string,
) {
  const catalogItem = await findOrCreateCatalogItem(prisma, householdId, rawName, categoryId)

  const existing = await prisma.listItem.findUnique({
    where: { listId_catalogItemId: { listId, catalogItemId: catalogItem.id } },
    include: { catalogItem: { include: { category: true } } },
  })

  if (existing) {
    if (existing.checked) {
      const updated = await prisma.listItem.update({
        where: { id: existing.id },
        data: { checked: false, checkedAt: null },
        include: { catalogItem: { include: { category: true } } },
      })
      return { item: updated, action: 'reactivated' as const }
    }
    return { item: existing, action: 'exists' as const }
  }

  const created = await prisma.listItem.create({
    data: { listId, catalogItemId: catalogItem.id },
    include: { catalogItem: { include: { category: true } } },
  })
  return { item: created, action: 'created' as const }
}

export async function toggleListItem(
  prisma: PrismaClient,
  listItemId: string,
  householdId: string,
  listId: string,
  checked: boolean,
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.listItem.update({
      where: { id: listItemId },
      data: {
        checked,
        checkedAt: checked ? new Date() : null,
      },
      include: { catalogItem: { include: { category: true } } },
    })

    if (checked) {
      await tx.purchaseEvent.create({
        data: {
          householdId,
          catalogItemId: updated.catalogItemId,
          listId,
        },
      })
    }

    return updated
  })
}

export async function updateItemCategory(
  prisma: PrismaClient,
  catalogItemId: string,
  categoryId: string,
) {
  return prisma.catalogItem.update({
    where: { id: catalogItemId },
    data: { categoryId },
    include: { category: true },
  })
}
