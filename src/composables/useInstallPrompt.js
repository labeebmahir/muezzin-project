import { ref } from 'vue'

export const installPromptEvent = ref(null)

export function captureInstallPrompt(e) {
  e.preventDefault()
  installPromptEvent.value = e
}
