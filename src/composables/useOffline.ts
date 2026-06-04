import { useOnline } from '@vueuse/core'

export function useOffline() {
  const isOnline = useOnline()
  return { isOnline }
}
