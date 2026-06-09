import type { PrismaClient } from '@prisma/client'
import { USUAL_ITEM_THRESHOLD, USUAL_ITEM_WINDOW_DAYS } from '../lib/categories.js'
import { addItemToList } from './items.js'

export async function getUsualCatalogItems(prisma: PrismaClient, householdId: string) {
  const since = new Date()
  since.setDate(since.getDate() - USUAL_ITEM_WINDOW_DAYS)

  const [manualItems, purchaseCounts] = await Promise.all([
    prisma.usualItem.findMany({
      where: { householdId, isManual: true },
      include: { catalogItem: { include: { category: true } } },
    }),
    prisma.purchaseEvent.groupBy({
      by: ['catalogItemId'],
      where: { householdId, purchasedAt: { gte: since } },
      _count: { catalogItemId: true },
    }),
  ])

  const autoIds = new Set(
    purchaseCounts
      .filter((p) => p._count.catalogItemId >= USUAL_ITEM_THRESHOLD)
      .map((p) => p.catalogItemId),
  )

  const manualIds = new Set(manualItems.map((m) => m.catalogItemId))

  const autoCatalogItems =
    autoIds.size > 0
      ? await prisma.catalogItem.findMany({
          where: {
            householdId,
            id: { in: [...autoIds].filter((id) => !manualIds.has(id)) },
          },
          include: { category: true },
        })
      : []

  const allItems = [
    ...manualItems.map((m) => ({
      catalogItem: m.catalogItem,
      isManual: true,
      purchaseCount: purchaseCounts.find((p) => p.catalogItemId === m.catalogItemId)?._count
        .catalogItemId,
    })),
    ...autoCatalogItems.map((c) => ({
      catalogItem: c,
      isManual: false,
      purchaseCount: purchaseCounts.find((p) => p.catalogItemId === c.id)?._count.catalogItemId,
    })),
  ]

  return allItems.sort((a, b) =>
    a.catalogItem.displayName.localeCompare(b.catalogItem.displayName),
  )
}

export async function addUsualItemsToList(
  prisma: PrismaClient,
  listId: string,
  householdId: string,
) {
  const usualItems = await getUsualCatalogItems(prisma, householdId)

  const added = []
  for (const usual of usualItems) {
    const result = await addItemToList(
      prisma,
      listId,
      householdId,
      usual.catalogItem.displayName,
      usual.catalogItem.categoryId,
    )
    if (result.action === 'created' || result.action === 'reactivated') {
      added.push(result.item)
    }
  }

  return added
}
