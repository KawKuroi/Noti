import { obtenerUsuario } from '@/lib/auth'
import { verificarLimite } from '@/lib/utils/rate-limit'
import { getRecordatoriosProximosParaApp } from '@/lib/queries/reminder.queries'

// Consumido por el scheduler local de la app Tauri (Windows/Android):
// devuelve los avisos programados de las proximas 48h para que la app
// los registre como notificaciones nativas sin depender del cron externo.
// Auth por sesion (el webview de la app comparte cookies con la web).
export async function GET() {
  const usuario = await obtenerUsuario()
  if (!usuario) return new Response('No autenticado', { status: 401 })

  const limite = await verificarLimite(`recordatorios-proximos:${usuario.id}`, 30, 60_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  const recordatorios = await getRecordatoriosProximosParaApp(usuario.id, 48)

  return Response.json({
    recordatorios: recordatorios.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      descripcion: r.descripcion,
      notificarEn: r.notificarEn.toISOString(),
    })),
  })
}
