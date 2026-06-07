'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, CheckCheck } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  obtenerNotificaciones,
  marcarNotificacionesLeidas,
} from '@/lib/actions/notification.actions'
import { formatearMomentoNota } from '@/lib/utils/date.utils'
import type { NotificacionHistorial } from '@/lib/queries/push.queries'

interface Props {
  itemsIniciales: NotificacionHistorial[]
  noLeidasIniciales: number
  variante?: 'sidebar' | 'compacto'
}

export function CentroNotificaciones({
  itemsIniciales,
  noLeidasIniciales,
  variante = 'sidebar',
}: Props) {
  const [items, setItems] = useState<NotificacionHistorial[]>(itemsIniciales)
  const [noLeidas, setNoLeidas] = useState(noLeidasIniciales)
  const [abierto, setAbierto] = useState(false)
  const [marcando, setMarcando] = useState(false)

  const refrescar = useCallback(async () => {
    const estado = await obtenerNotificaciones()
    setItems(estado.items)
    setNoLeidas(estado.noLeidas)
  }, [])

  // El Service Worker avisa a las pestanas abiertas cuando llega un push, para
  // subir el badge en vivo sin recargar.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    const handler = (e: MessageEvent) => {
      if (e.data?.tipo === 'nueva-notificacion') void refrescar()
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [refrescar])

  async function manejarApertura(open: boolean) {
    setAbierto(open)
    if (open) await refrescar()
  }

  async function marcarTodas() {
    if (marcando || noLeidas === 0) return
    setMarcando(true)
    // Optimista: al marcar como leidas salen del menu. Si el servidor falla, revertir.
    const itemsPrevios = items
    const noLeidasPrevias = noLeidas
    setItems([])
    setNoLeidas(0)
    try {
      const resultado = await marcarNotificacionesLeidas()
      if (!resultado.ok) throw new Error('fallo al marcar')
    } catch {
      setItems(itemsPrevios)
      setNoLeidas(noLeidasPrevias)
      toast.error('No se pudieron marcar como leidas')
    } finally {
      setMarcando(false)
    }
  }

  const insignia =
    noLeidas > 0 ? (
      <span
        className="mono"
        style={{
          minWidth: '18px',
          height: '18px',
          padding: '0 5px',
          borderRadius: '999px',
          background: 'var(--cat-eventos, #DC2626)',
          color: '#fff',
          fontSize: '10.5px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {noLeidas > 9 ? '9+' : noLeidas}
      </span>
    ) : null

  const boton =
    variante === 'sidebar' ? (
      <button
        onClick={() => void manejarApertura(true)}
        className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-[10px] text-[13px] font-normal transition-all duration-150 border border-transparent text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
      >
        <div className="flex items-center gap-3">
          <Bell size={16} className="text-[var(--ink-2)]" />
          <span>Notificaciones</span>
        </div>
        {insignia}
      </button>
    ) : (
      <button
        onClick={() => void manejarApertura(true)}
        aria-label="Notificaciones"
        style={{
          position: 'relative',
          padding: '6px',
          color: 'var(--ink-2)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
        }}
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              minWidth: '15px',
              height: '15px',
              padding: '0 3px',
              borderRadius: '999px',
              background: 'var(--cat-eventos, #DC2626)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
    )

  return (
    <>
      {boton}

      <Sheet open={abierto} onOpenChange={(open) => void manejarApertura(open)}>
        <SheetContent
          title="Notificaciones"
          description={noLeidas > 0 ? `${noLeidas} sin leer` : 'Estas al dia'}
          onClose={() => setAbierto(false)}
          footer={
            <button
              onClick={() => void marcarTodas()}
              disabled={marcando || noLeidas === 0}
              className="flex items-center gap-2 text-[13px] font-medium transition-colors disabled:opacity-40"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--line-2)',
                background: 'var(--bg)',
                color: 'var(--ink-2)',
                cursor: noLeidas === 0 ? 'default' : 'pointer',
              }}
            >
              <CheckCheck size={15} />
              Marcar todas como leidas
            </button>
          }
        >
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 0' }}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
                >
                  <Bell className="w-6 h-6" style={{ color: 'var(--ink-4)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  Sin notificaciones sin leer
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-3)' }}>
                  Aqui veras los avisos que te enviamos.
                </p>
              </div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((n) => (
                  <li
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 24px',
                      borderBottom: '1px solid var(--line)',
                      background: 'var(--bg-soft)',
                    }}
                  >
                    <span
                      style={{
                        marginTop: '6px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '999px',
                        flexShrink: 0,
                        background: 'var(--cat-eventos, #DC2626)',
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        className="font-medium"
                        style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: 1.4 }}
                      >
                        {n.titulo ?? 'Notificacion'}
                      </p>
                      {n.cuerpo && (
                        <p
                          style={{
                            fontSize: '12.5px',
                            color: 'var(--ink-2)',
                            lineHeight: 1.45,
                            marginTop: '2px',
                          }}
                        >
                          {n.cuerpo}
                        </p>
                      )}
                      <p
                        className="mono"
                        style={{ fontSize: '10.5px', color: 'var(--ink-3)', marginTop: '4px' }}
                      >
                        {formatearMomentoNota(
                          n.enviadoEn instanceof Date ? n.enviadoEn : new Date(n.enviadoEn),
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
