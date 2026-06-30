import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireHouseholdAccess, requireListAccess } from '../lib/access.js'
import { authenticate, handleError } from '../lib/auth-helpers.js'
import { formatCategory } from '../lib/categories.js'
import { emitListEvent } from '../lib/socket.js'
import {
  addItemToList,
  formatListItem,
  getListItems,
  toggleListItem,
  updateItemCategory,
} from '../services/items.js'
import { addUsualItemsToList } from '../services/usual-items.js'

const createListSchema = z.object({ name: z.string().min(1) })
const addItemSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().optional(),
})
const updateItemSchema = z.object({
  checked: z.boolean().optional(),
  categoryId: z.string().optional(),
})
const inviteSchema = z.object({ email: z.string().email() })

export async function listRoutes(app: FastifyInstance) {
  app.get('/households/:householdId/lists', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)

      const lists = await prisma.list.findMany({
        where: { householdId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: { where: { checked: false } } } },
        },
      })

      const sharedLists = await prisma.listMember.findMany({
        where: { userId: request.userId },
        include: {
          list: {
            include: {
              _count: { select: { items: { where: { checked: false } } } },
            },
          },
        },
      })

      const householdListIds = new Set(lists.map((l) => l.id))
      const externalShared = sharedLists
        .filter((s) => !householdListIds.has(s.list.id))
        .map((s) => s.list)

      const householdLists = lists.map((l) => ({
        id: l.id,
        name: l.name,
        householdId: l.householdId,
        uncheckedCount: l._count.items,
        createdAt: l.createdAt.toISOString(),
        isShared: false,
      }))

      const sharedListResults = externalShared.map((l) => ({
        id: l.id,
        name: l.name,
        householdId: l.householdId,
        uncheckedCount: l._count.items,
        createdAt: l.createdAt.toISOString(),
        isShared: true,
      }))

      return [...householdLists, ...sharedListResults]
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/households/:householdId/lists', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)
      const body = createListSchema.parse(request.body)

      const list = await prisma.list.create({
        data: { householdId, name: body.name, createdById: request.userId },
      })
      return { id: list.id, name: list.name, householdId: list.householdId }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.get('/lists/:listId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      await requireListAccess(prisma, request.userId, listId)

      const list = await prisma.list.findUnique({ where: { id: listId } })
      if (!list) return reply.status(404).send({ error: 'List not found' })

      const isHouseholdMember = await prisma.householdMember.findUnique({
        where: {
          householdId_userId: { householdId: list.householdId, userId: request.userId },
        },
      })

      const items = await getListItems(prisma, listId)
      return {
        id: list.id,
        name: list.name,
        householdId: list.householdId,
        isShared: !isHouseholdMember,
        items: items.map(formatListItem),
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.get('/lists/:listId/categories', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      const { householdId } = await requireListAccess(prisma, request.userId, listId)

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

  app.patch('/lists/:listId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      await requireListAccess(prisma, request.userId, listId)
      const body = createListSchema.parse(request.body)

      const list = await prisma.list.update({
        where: { id: listId },
        data: { name: body.name },
      })
      emitListEvent(listId, 'list_updated', { id: list.id, name: list.name })
      return { id: list.id, name: list.name }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.delete('/lists/:listId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      await requireListAccess(prisma, request.userId, listId)
      await prisma.list.delete({ where: { id: listId } })
      return { success: true }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/lists/:listId/items', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      const { householdId } = await requireListAccess(prisma, request.userId, listId)
      const body = addItemSchema.parse(request.body)

      const result = await addItemToList(prisma, listId, householdId, body.name, body.categoryId)
      const formatted = formatListItem(result.item)
      emitListEvent(listId, 'item_added', formatted)
      return { ...formatted, action: result.action }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.patch('/lists/:listId/items/:itemId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId, itemId } = request.params as { listId: string; itemId: string }
      const { householdId } = await requireListAccess(prisma, request.userId, listId)
      const body = updateItemSchema.parse(request.body)

      let item = await prisma.listItem.findFirst({
        where: { id: itemId, listId },
        include: { catalogItem: { include: { category: true } } },
      })
      if (!item) return reply.status(404).send({ error: 'Item not found' })

      if (body.checked !== undefined) {
        item = await toggleListItem(prisma, itemId, householdId, listId, body.checked)
      }

      if (body.categoryId !== undefined) {
        await updateItemCategory(prisma, item.catalogItemId, body.categoryId)
        item = await prisma.listItem.findUniqueOrThrow({
          where: { id: itemId },
          include: { catalogItem: { include: { category: true } } },
        })
      }

      const formatted = formatListItem(item)
      emitListEvent(listId, 'item_updated', formatted)
      return formatted
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.delete('/lists/:listId/items/:itemId', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId, itemId } = request.params as { listId: string; itemId: string }
      await requireListAccess(prisma, request.userId, listId)
      await prisma.listItem.delete({ where: { id: itemId } })
      emitListEvent(listId, 'item_deleted', { id: itemId })
      return { success: true }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/lists/:listId/add-usual', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      const { householdId } = await requireListAccess(prisma, request.userId, listId)

      const added = await addUsualItemsToList(prisma, listId, householdId)
      const formatted = added.map(formatListItem)
      for (const item of formatted) {
        emitListEvent(listId, 'item_added', item)
      }
      return { added: formatted }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/lists/:listId/invite', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string }
      await requireListAccess(prisma, request.userId, listId)
      const body = inviteSchema.parse(request.body)

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invite = await prisma.invite.create({
        data: {
          type: 'list',
          email: body.email,
          listId,
          invitedById: request.userId,
          expiresAt,
        },
      })
      return { token: invite.token, expiresAt: invite.expiresAt.toISOString() }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}
