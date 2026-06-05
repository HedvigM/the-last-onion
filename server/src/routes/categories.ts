import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireHouseholdAccess } from '../lib/access.js'
import { authenticate, handleError } from '../lib/auth-helpers.js'
import { formatCategory } from '../lib/categories.js'
import { getOtherCategoryId } from '../lib/seed-categories.js'

const createCategorySchema = z.object({ name: z.string().min(1) })
const reorderSchema = z.object({ categoryIds: z.array(z.string()) })

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/households/:householdId/categories', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)

      const categories = await prisma.category.findMany({
        where: { householdId },
        orderBy: { sortOrder: 'asc' },
      })
      return categories.map(formatCategory)
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/households/:householdId/categories', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)
      const body = createCategorySchema.parse(request.body)

      const maxOrder = await prisma.category.aggregate({
        where: { householdId },
        _max: { sortOrder: true },
      })

      const category = await prisma.category.create({
        data: {
          householdId,
          name: body.name,
          sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        },
      })
      return formatCategory(category)
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.patch('/categories/:categoryId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { categoryId } = request.params as { categoryId: string }
      const body = createCategorySchema.parse(request.body)

      const existing = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!existing) return reply.status(404).send({ error: 'Category not found' })
      await requireHouseholdAccess(prisma, request.userId, existing.householdId)

      if (existing.key) {
        return reply.status(400).send({ error: 'Cannot rename default categories' })
      }

      const category = await prisma.category.update({
        where: { id: categoryId },
        data: { name: body.name },
      })
      return formatCategory(category)
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.delete('/categories/:categoryId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { categoryId } = request.params as { categoryId: string }
      const existing = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!existing) return reply.status(404).send({ error: 'Category not found' })
      await requireHouseholdAccess(prisma, request.userId, existing.householdId)

      if (existing.key === 'other') {
        return reply.status(400).send({ error: 'Cannot delete the Other category' })
      }

      const otherId = await getOtherCategoryId(prisma, existing.householdId)
      await prisma.catalogItem.updateMany({
        where: { categoryId },
        data: { categoryId: otherId },
      })
      await prisma.category.delete({ where: { id: categoryId } })
      return { success: true }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.put('/households/:householdId/categories/reorder', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)
      const body = reorderSchema.parse(request.body)

      await prisma.$transaction(
        body.categoryIds.map((id, index) =>
          prisma.category.update({
            where: { id },
            data: { sortOrder: index },
          }),
        ),
      )
      return { success: true }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}
