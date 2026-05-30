import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { Server as SocketServer } from 'socket.io'
import { authRoutes } from './routes/auth.js'
import { householdRoutes } from './routes/households.js'
import { listRoutes } from './routes/lists.js'
import { categoryRoutes } from './routes/categories.js'
import { usualItemRoutes } from './routes/usual-items.js'
import { setSocketServer, setupSocketAuth } from './lib/socket.js'
import { corsOrigin, socketCorsOrigin } from './lib/cors-config.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  })

  app.get('/health', async () => ({ status: 'ok' }))

  await app.register(authRoutes)
  await app.register(householdRoutes)
  await app.register(listRoutes)
  await app.register(categoryRoutes)
  await app.register(usualItemRoutes)

  return app
}

export async function startServer() {
  const app = await buildApp()
  const port = Number(process.env.PORT ?? 3001)

  await app.listen({ port, host: '0.0.0.0' })

  const io = new SocketServer(app.server, {
    cors: {
      origin: socketCorsOrigin,
      credentials: true,
    },
  })

  setSocketServer(io)
  setupSocketAuth(io, async (token) => {
    try {
      const payload = app.jwt.verify<{ userId: string }>(token)
      return { userId: payload.userId }
    } catch {
      return null
    }
  })

  return app
}

startServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
