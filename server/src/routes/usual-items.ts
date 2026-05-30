import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireHouseholdAccess } from '../lib/access.js'
import { authenticate, handleError } from '../lib/auth-helpers.js'
import { findOrCreateCatalogItem } from '../services/items.js'
import { getUsualCatalogItems } from '../services/usual-items.js'

const pinSchema = z.object({
  name: z.string().min(1).optional(),
  catalogItemId: z.string().optional(),
})

export async function usualItemRoutes(app: FastifyInstance) {
  app.get('/households/:householdId/usual-items', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)

      const items = await getUsualCatalogItems(prisma, householdId)
      return items.map((item) => ({
        catalogItemId: item.catalogItem.id,
        displayName: item.catalogItem.displayName,
        categoryId: item.catalogItem.categoryId,
        categoryName: item.catalogItem.category.name,
        isManual: item.isManual,
        purchaseCount: item.purchaseCount ?? 0,
      }))
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/households/:householdId/usual-items', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)
      const body = pinSchema.parse(request.body)

      let catalogItemId = body.catalogItemId
      if (!catalogItemId && body.name) {
        const catalogItem = await findOrCreateCatalogItem(prisma, householdId, body.name)
        catalogItemId = catalogItem.id
      }
      if (!catalogItemId) {
        return reply.status(400).send({ error: 'name or catalogItemId required' })
      }

      await prisma.usualItem.upsert({
        where: {
          householdId_catalogItemId: { householdId, catalogItemId },
        },
        create: { householdId, catalogItemId, isManual: true },
        update: { isManual: true },
      })

      const catalogItem = await prisma.catalogItem.findUniqueOrThrow({
        where: { id: catalogItemId },
        include: { category: true },
      })

      return {
        catalogItemId: catalogItem.id,
        displayName: catalogItem.displayName,
        categoryName: catalogItem.category.name,
        isManual: true,
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.delete(
    '/households/:householdId/usual-items/:catalogItemId',
    { preHandler: authenticate },
    async (request, reply) => {
      try {
        const { householdId, catalogItemId } = request.params as {
          householdId: string
          catalogItemId: string
        }
        await requireHouseholdAccess(prisma, request.userId, householdId)

        await prisma.usualItem.deleteMany({
          where: { householdId, catalogItemId, isManual: true },
        })
        return { success: true }
      } catch (error) {
        const { statusCode, message } = handleError(error)
        return reply.status(statusCode).send({ error: message })
      }
    },
  )
}
