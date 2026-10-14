import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTheme } from './utils/theme.js'
import { registerSW } from 'virtual:pwa-register'

initTheme()

registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm('New version available! Reload to update?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('Maternova is ready to work offline.')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)