const CACHE_NOMBRE = 'noti-v1'
const URLS_CACHE = ['/']

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOMBRE).then((cache) => cache.addAll(URLS_CACHE)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== CACHE_NOMBRE)
          .map((clave) => caches.delete(clave)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return

  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        if (respuesta && respuesta.status === 200) {
          const copiaRespuesta = respuesta.clone()
          caches.open(CACHE_NOMBRE).then((cache) => {
            cache.put(evento.request, copiaRespuesta)
          })
        }
        return respuesta
      })
      .catch(() => caches.match(evento.request)),
  )
})

self.addEventListener('push', (evento) => {
  if (!evento.data) return

  const datos = evento.data.json()
  evento.waitUntil(
    self.registration.showNotification(datos.title, {
      body: datos.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: datos.data,
    }),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  evento.waitUntil(
    clients.openWindow(evento.notification.data?.url ?? '/'),
  )
})
