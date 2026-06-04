import { registerSW } from 'virtual:pwa-register'

export let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined

export function initPwa() {
  updateServiceWorker = registerSW({
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent('pwa:need-refresh'))
    },
  })
}
