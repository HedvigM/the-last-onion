import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireListAccess } from '../lib/access.js'
import { authenticate, handleError } from '../lib/auth-helpers.js'
import { findOrCreateCatalogItem } from '../services/items.js'
import { getUsualCatalogItems } from '../services/usual-items.js'

const pinSchema = z
  .object({
    name: z.unknown().optional(),
    catalogItemId: z.unknown().optional(),
  })
  .transform((body) => {
    const catalogItemId =
      typeof body.catalogItemId === 'string' ? body.catalogItemId : undefined
    const name = typeof body.name === 'string' ? body.name.trim() : undefined
    return { catalogItemId, name: name || undefined }
  })
  .refine((body) => !!(body.catalogItemId || body.name), {
    message: 'name or catalogItemId required',
  })

export async function usualItemRoutes(app: FastifyInstance) {
  app.get('/lists/:listId/usual-items', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      const { householdId } = await requireListAccess(prisma, request.userId, listId)

      const items = await getUsualCatalogItems(prisma, listId, householdId)
      return items.map((item) => ({
        catalogItemId: item.catalogItem.id,
        displayName: item.catalogItem.displayName,
        categoryId: item.catalogItem.categoryId,
        categoryKey: item.catalogItem.category.key,
        categoryName: item.catalogItem.category.name,
        isManual: item.isManual,
        purchaseCount: item.purchaseCount ?? 0,
      }))
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/lists/:listId/usual-items', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      const { householdId } = await requireListAccess(prisma, request.userId, listId)
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
          listId_catalogItemId: { listId, catalogItemId },
        },
        create: { listId, catalogItemId, isManual: true },
        update: { isManual: true },
      })

      const catalogItem = await prisma.catalogItem.findUniqueOrThrow({
        where: { id: catalogItemId },
        include: { category: true },
      })

      return {
        catalogItemId: catalogItem.id,
        displayName: catalogItem.displayName,
        categoryId: catalogItem.categoryId,
        categoryKey: catalogItem.category.key,
        categoryName: catalogItem.category.name,
        isManual: true,
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.delete(
    '/lists/:listId/usual-items/:catalogItemId',
    { preHandler: authenticate },
    async (request, reply) => {
      try {
        const { listId, catalogItemId } = request.params as {
          listId: string
          catalogItemId: string
        }
        await requireListAccess(prisma, request.userId, listId)

        await prisma.usualItem.deleteMany({
          where: { listId, catalogItemId, isManual: true },
        })
        return { success: true }
      } catch (error) {
        const { statusCode, message } = handleError(error)
        return reply.status(statusCode).send({ error: message })
      }
    },
  )
}
