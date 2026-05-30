import type { Server as HttpServer } from 'node:http'
import type { Server as SocketServer } from 'socket.io'

let io: SocketServer | null = null

export function setSocketServer(server: SocketServer) {
  io = server
}

export function emitListEvent(
  listId: string,
  event: 'item_added' | 'item_updated' | 'item_deleted' | 'list_updated',
  data: unknown,
) {
  io?.to(`list:${listId}`).emit(event, data)
}

export function setupSocketAuth(
  socketServer: SocketServer,
  verifyToken: (token: string) => Promise<{ userId: string } | null>,
) {
  socketServer.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined
    if (!token) {
      next(new Error('Authentication required'))
      return
    }
    const payload = await verifyToken(token)
    if (!payload) {
      next(new Error('Invalid token'))
      return
    }
    socket.data.userId = payload.userId
    next()
  })

  socketServer.on('connection', (socket) => {
    socket.on('join_list', (listId: string) => {
      socket.join(`list:${listId}`)
    })
    socket.on('leave_list', (listId: string) => {
      socket.leave(`list:${listId}`)
    })
  })
}

export type { HttpServer }
