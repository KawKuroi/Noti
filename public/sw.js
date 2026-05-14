const CACHE_NOMBRE = 'noti-v2'
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

  const opciones = {
    body: datos.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: datos.data,
    tag: datos.data?.reminderId ?? 'noti-general',
    renotify: true,
    actions: [
      { action: 'ver', title: 'Ver' },
      { action: 'posponer', title: 'Posponer 15min' },
      { action: 'completar', title: 'Completar' },
    ],
  }

  evento.waitUntil(
    self.registration.showNotification(datos.title, opciones),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const accion = evento.action
  const datos = evento.notification.data ?? {}

  if (accion === 'posponer' || accion === 'completar') {
    evento.waitUntil(
      fetch('/api/push/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId: datos.reminderId, action: accion }),
      }).catch(() => null),
    )
    return
  }

  // accion === 'ver' o click directo en la notificacion
  const url = datos.url ?? '/'
  evento.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((listaClientes) => {
      for (const cliente of listaClientes) {
        if (cliente.url === url && 'focus' in cliente) {
          return cliente.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})

// Cuando el navegador rota la suscripcion push, re-registrar automaticamente
self.addEventListener('pushsubscriptionchange', (evento) => {
  evento.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: evento.oldSubscription?.options?.applicationServerKey,
      })
      .then((nuevaSuscripcion) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaSuscripcion.toJSON()),
        })
      })
      .catch(() => null),
  )
})
