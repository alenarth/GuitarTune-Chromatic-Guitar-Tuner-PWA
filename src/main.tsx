import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Only log in development — avoids leaking deployment details in production
        if (import.meta.env.DEV) {
          console.log('[SW] Registered:', registration.scope)
        }
      })
      .catch(() => {
        // Generic message in production — no internal details exposed
        if (import.meta.env.DEV) {
          console.warn('[SW] Registration failed')
        }
      })
  })
}
