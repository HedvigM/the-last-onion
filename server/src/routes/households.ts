import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireHouseholdAccess } from '../lib/access.js'
import { authenticate, optionalAuthenticate, handleError } from '../lib/auth-helpers.js'
import { seedDefaultCategories } from '../lib/seed-categories.js'

const createHouseholdSchema = z.object({ name: z.string().min(1) })
const inviteSchema = z.object({ email: z.string().email() })

export async function householdRoutes(app: FastifyInstance) {
  app.get('/households', { preHandler: authenticate }, async (request, reply) => {
    try {
      const memberships = await prisma.householdMember.findMany({
        where: { userId: request.userId },
        include: {
          household: {
            include: {
              members: { include: { user: { select: { id: true, email: true, displayName: true } } } },
            },
          },
        },
      })
      return memberships.map((m) => ({
        id: m.household.id,
        name: m.household.name,
        role: m.role,
        members: m.household.members.map((hm) => ({
          userId: hm.user.id,
          email: hm.user.email,
          displayName: hm.user.displayName,
          role: hm.role,
        })),
      }))
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/households', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = createHouseholdSchema.parse(request.body)
      const household = await prisma.household.create({ data: { name: body.name } })
      await seedDefaultCategories(prisma, household.id)
      await prisma.householdMember.create({
        data: { householdId: household.id, userId: request.userId, role: 'owner' },
      })
      return { id: household.id, name: household.name }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/households/:householdId/invite', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { householdId } = request.params as { householdId: string }
      await requireHouseholdAccess(prisma, request.userId, householdId)
      const body = inviteSchema.parse(request.body)

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invite = await prisma.invite.create({
        data: {
          type: 'household',
          email: body.email,
          householdId,
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

  app.get('/invites/:token', { preHandler: optionalAuthenticate }, async (request, reply) => {
    try {
      const { token } = request.params as { token: string }
      const invite = await prisma.invite.findUnique({
        where: { token },
        include: {
          invitedBy: { select: { displayName: true } },
          household: { select: { id: true, name: true } },
          list: { select: { id: true, name: true, householdId: true } },
        },
      })

      if (!invite) {
        return reply.status(404).send({ error: 'Invite not found' })
      }

      let status: 'valid' | 'expired' | 'accepted' = 'valid'
      if (invite.acceptedAt) status = 'accepted'
      else if (invite.expiresAt < new Date()) status = 'expired'

      let alreadyMember = false
      if (request.userId) {
        if (invite.type === 'household' && invite.householdId) {
          const member = await prisma.householdMember.findUnique({
            where: {
              householdId_userId: { householdId: invite.householdId, userId: request.userId },
            },
          })
          alreadyMember = !!member
        } else if (invite.type === 'list' && invite.listId) {
          const list = await prisma.list.findUnique({
            where: { id: invite.listId },
            include: { household: { include: { members: true } }, members: true },
          })
          if (list) {
            alreadyMember =
              list.household.members.some((m) => m.userId === request.userId) ||
              list.members.some((m) => m.userId === request.userId)
          }
        }
      }

      return {
        type: invite.type,
        invitedBy: invite.invitedBy.displayName,
        targetName:
          invite.type === 'household' ? invite.household?.name : invite.list?.name,
        email: invite.email,
        status,
        alreadyMember,
        listId: invite.listId,
        householdId: invite.householdId,
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/invites/:token/accept', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { token } = request.params as { token: string }
      const invite = await prisma.invite.findUnique({
        where: { token },
        include: {
          household: { select: { id: true, name: true } },
          list: { select: { id: true, name: true, householdId: true } },
        },
      })
      if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        return reply.status(400).send({ error: 'Invalid or expired invite' })
      }

      if (invite.type === 'household' && invite.householdId) {
        await prisma.householdMember.upsert({
          where: {
            householdId_userId: { householdId: invite.householdId, userId: request.userId },
          },
          create: {
            householdId: invite.householdId,
            userId: request.userId,
            role: 'member',
          },
          update: {},
        })
      } else if (invite.type === 'list' && invite.listId) {
        await prisma.listMember.upsert({
          where: { listId_userId: { listId: invite.listId, userId: request.userId } },
          create: { listId: invite.listId, userId: request.userId, role: 'editor' },
          update: {},
        })
      }

      await prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      })

      return {
        success: true,
        type: invite.type,
        listId: invite.listId,
        householdId: invite.householdId ?? invite.list?.householdId,
        name: invite.type === 'household' ? invite.household?.name : invite.list?.name,
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}
