// Scheduler local de notificaciones de la app Tauri (Fases 30/31).
// Se inyecta como init script en el webview que carga la web de produccion.
// Solo actua dentro de Tauri (window.__TAURI__); en el navegador normal es un no-op.
//
// - Escritorio (Windows): timers JS + notificacion nativa al vencer. La app vive
//   en la bandeja, asi que el webview (y sus timers) siguen corriendo.
// - Android: timers JS mueren con la app, asi que se registran notificaciones
//   programadas en el SO (AlarmManager via plugin notification.schedule) que
//   disparan a la hora exacta aunque la app este cerrada.
(function () {
  'use strict'
  if (!window.__TAURI__ || !window.__TAURI__.notification) return

  var notificacion = window.__TAURI__.notification
  var INTERVALO_SYNC_MS = 15 * 60 * 1000
  var esAndroid = /android/i.test(navigator.userAgent)
  var temporizadores = new Map() // id recordatorio -> handle de setTimeout

  // Los ids de notificacion en Android son enteros: hash estable del UUID.
  function hashId(texto) {
    var hash = 0
    for (var i = 0; i < texto.length; i++) {
      hash = (hash * 31 + texto.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  function asegurarPermiso() {
    return notificacion.isPermissionGranted().then(function (ok) {
      if (ok) return true
      return notificacion.requestPermission().then(function (r) {
        return r === 'granted'
      })
    })
  }

  function cuerpoDe(r) {
    return r.descripcion || 'Es momento de revisar este recordatorio'
  }

  function programarEscritorio(recordatorios) {
    temporizadores.forEach(function (handle) {
      clearTimeout(handle)
    })
    temporizadores.clear()

    var ahora = Date.now()
    recordatorios.forEach(function (r) {
      var espera = new Date(r.notificarEn).getTime() - ahora
      if (espera < -60000) return
      var handle = setTimeout(function () {
        temporizadores.delete(r.id)
        notificacion.sendNotification({ title: r.titulo, body: cuerpoDe(r) })
      }, Math.max(espera, 0))
      temporizadores.set(r.id, handle)
    })
  }

  function programarAndroid(recordatorios) {
    // Reconciliacion: cancelar todo lo pendiente y registrar el set fresco.
    // Las programadas sobreviven al cierre de la app (AlarmManager).
    return notificacion
      .pending()
      .then(function (pendientes) {
        var ids = pendientes.map(function (p) {
          return p.id
        })
        return ids.length > 0 ? notificacion.cancel(ids) : undefined
      })
      .then(function () {
        var ahora = Date.now()
        recordatorios.forEach(function (r) {
          var cuando = new Date(r.notificarEn)
          if (cuando.getTime() <= ahora) return
          notificacion.sendNotification({
            id: hashId(r.id),
            title: r.titulo,
            body: cuerpoDe(r),
            schedule: notificacion.Schedule.at(cuando),
            extra: { reminderId: r.id },
          })
        })
      })
  }

  function sincronizar() {
    fetch('/api/recordatorios/proximos', { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
      })
      .then(function (datos) {
        return asegurarPermiso().then(function (permitido) {
          if (!permitido) return
          var recordatorios = datos.recordatorios || []
          return esAndroid
            ? programarAndroid(recordatorios)
            : programarEscritorio(recordatorios)
        })
      })
      .catch(function (e) {
        // Sin sesion (401) o sin red: se reintenta en el proximo ciclo.
        console.warn('[noti-app] sync de notificaciones fallo:', e)
      })
  }

  window.addEventListener('focus', sincronizar)
  setInterval(sincronizar, INTERVALO_SYNC_MS)
  // Primera pasada diferida: dar tiempo a que la sesion del webview cargue.
  setTimeout(sincronizar, 5000)
})()
