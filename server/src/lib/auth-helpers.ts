import type { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AccessError } from '../lib/access.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string }
    user: { userId: string }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}

export async function authenticate(request: FastifyRequest) {
  try {
    const payload = await request.jwtVerify<{ userId: string }>()
    request.userId = payload.userId
  } catch {
    throw new AccessError('Unauthorized', 401)
  }
}

export function handleError(error: unknown): { statusCode: number; message: string } {
  if (error instanceof AccessError) {
    return { statusCode: error.statusCode, message: error.message }
  }
  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => {
        const field = issue.path.length ? issue.path.join('.') : 'body'
        return `${field}: ${issue.message}`
      })
      .join(', ')
    return { statusCode: 400, message: message || 'Validation error' }
  }
  console.error(error)
  return { statusCode: 500, message: 'Internal server error' }
}

export async function getUserOrThrow(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AccessError('User not found', 404)
  return user
}

export type AppInstance = FastifyInstance
