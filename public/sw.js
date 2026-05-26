const CACHE_NOMBRE = 'noti-v4'
const URLS_CACHE = ['/']
const DB_NOMBRE = 'noti-sync'
const STORE_PENDIENTES = 'operaciones-pendientes'

// --- IndexedDB helpers ---

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOMBRE, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_PENDIENTES)) {
        db.createObjectStore(STORE_PENDIENTES, { autoIncrement: true })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

async function guardarOperacionPendiente(url, metodo, cuerpo) {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDIENTES, 'readwrite')
    tx.objectStore(STORE_PENDIENTES).add({ url, metodo, cuerpo, timestamp: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function obtenerOperacionesPendientes() {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDIENTES, 'readonly')
    const req = tx.objectStore(STORE_PENDIENTES).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function limpiarOperacionesPendientes() {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDIENTES, 'readwrite')
    tx.objectStore(STORE_PENDIENTES).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// --- Lifecycle ---

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

// --- Fetch: network-first para GET, background sync para mutaciones ---

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url)

  // Solo interceptar requests del mismo origen
  if (url.origin !== self.location.origin) return

  if (evento.request.method === 'GET') {
    // Excluir API routes del cache para siempre obtener datos frescos
    if (url.pathname.startsWith('/api/')) return

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
        .catch(() => caches.match(evento.request).then((r) => r ?? new Response('Sin conexion', { status: 503 }))),
    )
    return
  }

  // Para mutaciones en rutas de la app: guardar si falla la red
  if (
    evento.request.method === 'POST' &&
    url.pathname.startsWith('/api/') &&
    !url.pathname.includes('/api/push/') &&
    !url.pathname.includes('/api/contacto')
  ) {
    evento.respondWith(
      fetch(evento.request.clone()).catch(async () => {
        try {
          const cuerpo = await evento.request.clone().text()
          await guardarOperacionPendiente(url.pathname, 'POST', cuerpo)
          self.registration.sync?.register('sync-recordatorios').catch(() => null)
        } catch {
          // ignorar errores de almacenamiento
        }
        return new Response(JSON.stringify({ ok: false, pendiente: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )
    return
  }
})

// --- Background Sync ---

self.addEventListener('sync', (evento) => {
  if (evento.tag === 'sync-recordatorios') {
    evento.waitUntil(reintentarOperacionesPendientes())
  }
})

async function reintentarOperacionesPendientes() {
  const pendientes = await obtenerOperacionesPendientes()
  if (!pendientes.length) return

  let todoExitoso = true
  for (const op of pendientes) {
    try {
      const res = await fetch(op.url, {
        method: op.metodo,
        headers: { 'Content-Type': 'application/json' },
        body: op.cuerpo,
      })
      if (!res.ok) todoExitoso = false
    } catch {
      todoExitoso = false
    }
  }

  if (todoExitoso) {
    await limpiarOperacionesPendientes()
  }
}

// --- Push notifications ---

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
    actions: datos.data?.reminderId === 'daily-summary'
      ? [{ action: 'ver', title: 'Ver recordatorios' }]
      : [
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

// --- PWA Widget API (experimental, Edge/Chrome en Windows 11) ---

async function actualizarWidget() {
  if (!self.widgets) return
  try {
    const respuesta = await fetch('/api/widget')
    if (!respuesta.ok) return
    const datos = await respuesta.json()
    const payload = {
      template: 'noti-proximos',
      data: JSON.stringify(datos),
    }
    await self.widgets.updateByTag('noti-proximos', payload)
  } catch {
    // El widget no es critico; ignorar errores de red
  }
}

self.addEventListener('widgetinstall', (evento) => {
  evento.waitUntil(actualizarWidget())
})

self.addEventListener('widgetresume', (evento) => {
  evento.waitUntil(actualizarWidget())
})

self.addEventListener('widgetuninstall', (evento) => {
  evento.waitUntil(
    Promise.resolve(),
  )
})

self.addEventListener('widgetclick', (evento) => {
  if (evento.action === 'abrir') {
    evento.waitUntil(
      clients.openWindow('/inicio'),
    )
  }
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
