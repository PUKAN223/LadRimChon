const VERSION = 'ladrimchon-v2'
const APP_SHELL_CACHE = `${VERSION}-shell`
const PAGE_CACHE = `${VERSION}-pages`
const ASSET_CACHE = `${VERSION}-assets`
const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/main-logo.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('ladrimchon-') && !key.startsWith(VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
    return
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

async function networkFirstPage(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(PAGE_CACHE)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    return (await caches.match(request)) || (await caches.match('/offline')) || new Response('Offline', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone())
      return response
    })
    .catch(() => cached || new Response('Offline', { status: 503 }))

  return cached || network
}

function isStaticAsset(pathname) {
  return /\.(?:css|js|mjs|png|jpe?g|webp|svg|ico|woff2?|ttf)$/i.test(pathname) || pathname.startsWith('/_next/static/')
}

// ── Native Notification Event Handlers ─────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/orders'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  try {
    const data = event.data.json()
    const title = data.title || 'หลาดริมชล'
    const options = {
      body: data.body || 'มีการอัปเดตสถานะออเดอร์ของคุณ',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url: data.url || '/orders' },
      vibrate: [200, 100, 200],
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch {
    const text = event.data.text()
    event.waitUntil(
      self.registration.showNotification('หลาดริมชล', {
        body: text,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      })
    )
  }
})
