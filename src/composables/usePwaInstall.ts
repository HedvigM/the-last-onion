import { onMounted, onUnmounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const canInstall = ref(false)
  const isIos = ref(false)
  let deferredPrompt: BeforeInstallPromptEvent | null = null

  function onBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    canInstall.value = true
  }

  onMounted(() => {
    isIos.value =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  })

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
  }

  return { canInstall, isIos, install }
}
