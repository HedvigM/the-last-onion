import { onUnmounted, watch, type Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { getToken } from '@/api/client'
import { useListsStore } from '@/stores/lists'
import type { ListItem } from '@/types'

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function useRealtime(listId: Ref<string | undefined>) {
  const listsStore = useListsStore()
  let socket: Socket | null = null

  function connect(id: string) {
    disconnect()
    const token = getToken()
    if (!token) return

    socket = io(SOCKET_URL, { auth: { token } })
    socket.emit('join_list', id)

    let hadConnected = false
    socket.on('connect', () => {
      if (hadConnected) {
        listsStore.fetchList(id)
      }
      hadConnected = true
    })

    socket.on('item_added', (data: ListItem) => {
      listsStore.handleSocketEvent('item_added', data)
    })
    socket.on('item_updated', (data: ListItem) => {
      listsStore.handleSocketEvent('item_updated', data)
    })
    socket.on('item_deleted', (data: { id: string }) => {
      listsStore.handleSocketEvent('item_deleted', data)
    })
    socket.on('list_updated', (data: { id: string; name: string }) => {
      listsStore.handleSocketEvent('list_updated', data)
    })
  }

  function disconnect() {
    if (socket) {
      if (listId.value) socket.emit('leave_list', listId.value)
      socket.disconnect()
      socket = null
    }
  }

  watch(
    listId,
    (id) => {
      if (id) connect(id)
      else disconnect()
    },
    { immediate: true },
  )

  onUnmounted(disconnect)

  return { disconnect }
}
