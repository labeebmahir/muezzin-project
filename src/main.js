import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { captureInstallPrompt } from './composables/useInstallPrompt.js'

window.addEventListener('beforeinstallprompt', captureInstallPrompt)

createApp(App).mount('#app')
