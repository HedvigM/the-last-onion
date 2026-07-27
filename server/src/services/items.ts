import type { PrismaClient } from '@prisma/client'
import { formatCategory, guessCategoryKey } from '../lib/categories.js'
import { displayItemName, normalizeItemName } from '../lib/normalize.js'
import type { Unit } from '../lib/units.js'

export type ItemQuantityInput = {
  quantity?: number | null
  unit?: Unit | null
}

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
    const categoryKey = guessCategoryKey(rawName)
    const category = await prisma.category.findFirst({
      where: { householdId, key: categoryKey },
    })
    if (!category) {
      const other = await prisma.category.findFirst({
        where: { householdId, key: 'other' },
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
    quantity: item.quantity ?? null,
    unit: item.unit ?? null,
    createdAt: item.createdAt.toISOString(),
    catalogItem: {
      id: item.catalogItem.id,
      displayName: item.catalogItem.displayName,
      normalizedName: item.catalogItem.normalizedName,
      categoryId: item.catalogItem.categoryId,
      category: formatCategory(item.catalogItem.category),
    },
  }
}

function quantityData(qty?: ItemQuantityInput) {
  if (!qty) return {}
  const data: { quantity?: number | null; unit?: string | null } = {}
  if (qty.quantity !== undefined) data.quantity = qty.quantity
  if (qty.unit !== undefined) data.unit = qty.unit
  return data
}

export async function addItemToList(
  prisma: PrismaClient,
  listId: string,
  householdId: string,
  rawName: string,
  categoryId?: string,
  qty?: ItemQuantityInput,
) {
  const catalogItem = await findOrCreateCatalogItem(prisma, householdId, rawName, categoryId)
  const qtyFields = quantityData(qty)
  const hasQtyUpdate = Object.keys(qtyFields).length > 0

  const existing = await prisma.listItem.findUnique({
    where: { listId_catalogItemId: { listId, catalogItemId: catalogItem.id } },
    include: { catalogItem: { include: { category: true } } },
  })

  if (existing) {
    if (existing.checked) {
      const updated = await prisma.listItem.update({
        where: { id: existing.id },
        data: { checked: false, checkedAt: null, ...qtyFields },
        include: { catalogItem: { include: { category: true } } },
      })
      return { item: updated, action: 'reactivated' as const }
    }
    if (hasQtyUpdate) {
      const updated = await prisma.listItem.update({
        where: { id: existing.id },
        data: qtyFields,
        include: { catalogItem: { include: { category: true } } },
      })
      return { item: updated, action: 'updated' as const }
    }
    return { item: existing, action: 'exists' as const }
  }

  const created = await prisma.listItem.create({
    data: { listId, catalogItemId: catalogItem.id, ...qtyFields },
    include: { catalogItem: { include: { category: true } } },
  })
  return { item: created, action: 'created' as const }
}

export async function updateItemQuantity(
  prisma: PrismaClient,
  listItemId: string,
  quantity: number | null,
  unit: string | null,
) {
  return prisma.listItem.update({
    where: { id: listItemId },
    data: { quantity, unit },
    include: { catalogItem: { include: { category: true } } },
  })
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
