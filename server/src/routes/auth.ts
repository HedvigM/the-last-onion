import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { seedDefaultCategories } from '../lib/seed-categories.js'
import { authenticate, getUserOrThrow, handleError } from '../lib/auth-helpers.js'

const languageSchema = z.enum(['en', 'sv'])

function optionalNonEmptyString() {
  return z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().trim().min(1).optional(),
  )
}

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  displayName: z.string().trim().min(1, 'Name is required'),
  householdName: optionalNonEmptyString(),
  language: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    languageSchema.optional(),
  ),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const updateMeSchema = z.object({
  language: languageSchema,
})

function formatUser(user: { id: string; email: string; displayName: string; language: string }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    language: user.language,
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body)
      const existing = await prisma.user.findUnique({ where: { email: body.email } })
      if (existing) {
        return reply.status(409).send({ error: 'Email already registered' })
      }

      const passwordHash = await bcrypt.hash(body.password, 10)
      const user = await prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          displayName: body.displayName,
          language: body.language ?? 'en',
        },
      })

      const household = await prisma.household.create({
        data: { name: body.householdName ?? `${body.displayName}'s Household` },
      })
      await seedDefaultCategories(prisma, household.id)
      await prisma.householdMember.create({
        data: { householdId: household.id, userId: user.id, role: 'owner' },
      })

      const token = app.jwt.sign({ userId: user.id })
      return {
        token,
        user: formatUser(user),
        household: { id: household.id, name: household.name },
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body)
      const user = await prisma.user.findUnique({ where: { email: body.email } })
      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }
      const valid = await bcrypt.compare(body.password, user.passwordHash)
      if (!valid) {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }

      const memberships = await prisma.householdMember.findMany({
        where: { userId: user.id },
        include: { household: true },
      })

      const token = app.jwt.sign({ userId: user.id })
      return {
        token,
        user: formatUser(user),
        households: memberships.map((m) => ({
          id: m.household.id,
          name: m.household.name,
          role: m.role,
        })),
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    try {
      const user = await getUserOrThrow(request.userId)
      const memberships = await prisma.householdMember.findMany({
        where: { userId: user.id },
        include: { household: true },
      })
      return {
        user: formatUser(user),
        households: memberships.map((m) => ({
          id: m.household.id,
          name: m.household.name,
          role: m.role,
        })),
      }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.patch('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = updateMeSchema.parse(request.body)
      const user = await prisma.user.update({
        where: { id: request.userId },
        data: { language: body.language },
      })
      return { user: formatUser(user) }
    } catch (error) {
      const { statusCode, message } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}
