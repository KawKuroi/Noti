'use client'

import { useTransition } from 'react'
import { Trash2, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { eliminarSuscripcion } from '@/lib/actions/push-subscription.actions'
import type { SuscripcionPush } from '@/lib/queries/push.queries'

interface Props {
  suscripciones: SuscripcionPush[]
}

export function ListaDispositivos({ suscripciones }: Props) {
  const [pending, startTransition] = useTransition()

  const eliminar = (id: string) => {
    startTransition(async () => {
      const resultado = await eliminarSuscripcion(id)
      if (resultado.ok) {
        toast.success('Dispositivo eliminado')
      } else {
        toast.error(resultado.error ?? 'Error al eliminar el dispositivo')
      }
    })
  }

  if (suscripciones.length === 0) {
    return (
      <p style={{ fontSize: '13.5px', color: 'var(--ink-3)' }}>
        Ningun dispositivo registrado. Activa las notificaciones desde el dashboard.
      </p>
    )
  }

  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {suscripciones.map((sus) => (
        <li
          key={sus.id}
          className="flex items-center justify-between"
          style={{
            padding: '10px 12px',
            background: 'var(--bg-soft)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
          }}
        >
          <div className="flex items-center gap-3">
            <Monitor size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <div>
              <p className="font-medium" style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
                {sus.nombreDispositivo ?? 'Dispositivo desconocido'}
              </p>
              <p
                className="mono"
                suppressHydrationWarning
                style={{ fontSize: '11px', color: 'var(--ink-3)', fontWeight: 500, marginTop: '2px' }}
              >
                Registrado{' '}
                {formatDistanceToNow(new Date(sus.creadoEn), { locale: es, addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="mono font-semibold"
              style={{
                fontSize: '10px',
                letterSpacing: '0.08em',
                padding: '2px 7px',
                borderRadius: '999px',
                background: 'color-mix(in oklab, #16a34a 12%, transparent)',
                color: '#16a34a',
              }}
            >
              ACTIVO
            </span>
            <button
              onClick={() => eliminar(sus.id)}
              disabled={pending}
              className="transition-colors"
              style={{ padding: '6px', color: 'var(--ink-4)', borderRadius: '6px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-4)')}
              aria-label="Eliminar dispositivo"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
