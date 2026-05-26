'use client'

import { useState, type ReactNode } from 'react'
import {
  BookMarked,
  Briefcase,
  Cake,
  Calendar as CalendarIcon,
  Check,
  Film,
  Gamepad2,
  GraduationCap,
  LayoutGrid,
  MapPin,
  Music,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  type LucideIcon,
} from 'lucide-react'

type TabId = 'dashboard' | 'calendar' | 'search'

export function AppPreview() {
  const [tab, setTab] = useState<TabId>('dashboard')

  const tabs: { id: TabId; label: string; icono: LucideIcon }[] = [
    { id: 'dashboard', label: 'Dashboard', icono: LayoutGrid },
    { id: 'calendar', label: 'Calendario', icono: CalendarIcon },
    { id: 'search', label: 'Busqueda', icono: Search },
  ]

  return (
    <section
      style={{
        paddingTop: 'var(--pad-section)',
        paddingBottom: 'var(--pad-section)',
        borderTop: '1px solid var(--line)',
        background: 'var(--bg-soft)',
      }}
    >
      <div className="wrap">
        <div
          className="reveal"
          style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}
        >
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            El producto
          </div>
          <h2 style={{ fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 1.04, marginTop: 14 }}>
            Limpio. Rapido. <span style={{ color: 'var(--ink-3)' }}>Tuyo.</span>
          </h2>
        </div>

        <div
          className="reveal"
          data-d="1"
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              gap: 4,
              borderRadius: 999,
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
            }}
          >
            {tabs.map((t) => {
              const Icono = t.icono
              const activo = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: 0,
                    cursor: 'pointer',
                    background: activo ? 'var(--ink)' : 'transparent',
                    color: activo ? 'var(--bg)' : 'var(--ink-2)',
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all .2s ease',
                  }}
                >
                  <Icono size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="reveal"
          data-d="2"
          style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}
        >
          {tab === 'dashboard' && <DashboardMock />}
          {tab === 'calendar' && <CalendarMock />}
          {tab === 'search' && <SearchMock />}
        </div>
      </div>
    </section>
  )
}

function MockShell({
  children,
  titulo,
  subtitulo,
}: {
  children: ReactNode
  titulo: string
  subtitulo: string
}) {
  return (
    <div
      className="card-landing anim-float-in"
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        animationDuration: '.5s',
        boxShadow:
          '0 50px 100px -40px rgba(10,10,10,.22), 0 12px 30px -15px rgba(10,10,10,.10)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-soft)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
            <span
              key={c}
              style={{
                width: 11,
                height: 11,
                borderRadius: 99,
                background: c,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 12 }}>
          {titulo}
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', marginLeft: 'auto' }}>
          {subtitulo}
        </div>
      </div>
      <div style={{ background: 'var(--bg)' }}>{children}</div>
    </div>
  )
}

interface ItemDashboard {
  icono: LucideIcon
  color: string
  titulo: string
  sub: string
  hecho: boolean
}

function DashboardMock() {
  const grupos: { label: string; items: ItemDashboard[] }[] = [
    {
      label: 'Hoy - jue 15 nov',
      items: [
        {
          icono: GraduationCap,
          color: 'var(--cat-estudio)',
          titulo: 'Clase de ingles',
          sub: '19:00 - semanal',
          hecho: false,
        },
        {
          icono: Film,
          color: 'var(--cat-peliculas)',
          titulo: 'Dune: Parte 3',
          sub: 'Estreno hoy - 06:00',
          hecho: false,
        },
        {
          icono: MapPin,
          color: 'var(--cat-pendientes)',
          titulo: 'Comprar regalo de Maria',
          sub: 'vence hoy',
          hecho: true,
        },
      ],
    },
    {
      label: 'Manana',
      items: [
        {
          icono: Cake,
          color: 'var(--cat-cumple)',
          titulo: 'Cumpleanos de Maria',
          sub: '00:00',
          hecho: false,
        },
        {
          icono: Briefcase,
          color: 'var(--cat-eventos)',
          titulo: 'Cita medica',
          sub: '15:00',
          hecho: false,
        },
      ],
    },
    {
      label: 'Esta semana',
      items: [
        {
          icono: Gamepad2,
          color: 'var(--cat-juegos)',
          titulo: 'GTA VI',
          sub: 'jue 19 nov - 06:00',
          hecho: false,
        },
        {
          icono: GraduationCap,
          color: 'var(--cat-estudio)',
          titulo: 'Examen de Calculo II',
          sub: 'vie 21 nov - 09:00',
          hecho: false,
        },
        {
          icono: Music,
          color: 'var(--cat-musica)',
          titulo: 'Tame Impala - Deadbeat',
          sub: 'vie 27 mar 2026',
          hecho: false,
        },
      ],
    },
  ]

  return (
    <MockShell titulo="noti.app/inicio" subtitulo="proximos - 8">
      <div className="dashboard-grid">
        <div className="dashboard-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', marginBottom: 12 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                background: 'var(--ink)',
                color: 'var(--bg)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              N
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Noti</div>
          </div>
          <SideItem icono={LayoutGrid} label="Proximos" count="8" activo />
          <SideItem icono={Sparkles} label="Lanzamientos" count="3" />
          <SideItem icono={Cake} label="Cumpleanos" count="1" />
          <SideItem icono={GraduationCap} label="Estudio" count="2" />
          <SideItem icono={MapPin} label="Pendientes" count="1" />
          <SideItem icono={Briefcase} label="Eventos" count="1" />
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 16,
              padding: '4px 8px',
            }}
          >
            Herramientas
          </div>
          <SideItem icono={StickyNote} label="Notas" />
          <SideItem icono={CalendarIcon} label="Calendario" />
          <SideItem icono={Search} label="Buscar" hint="Ctrl+K" />
        </div>

        <div style={{ padding: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 22,
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>Proximos</h3>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              <Plus size={14} /> Nuevo
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {grupos.map((g) => (
              <div key={g.label}>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                    marginBottom: 10,
                  }}
                >
                  {g.label}
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {g.items.map((it) => {
                    const Icono = it.icono
                    return (
                      <div
                        key={it.titulo}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto auto 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: 'var(--bg-elev)',
                          border: '1px solid var(--line)',
                          opacity: it.hecho ? 0.5 : 1,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            border: `1.5px solid ${it.hecho ? it.color : 'var(--ink-4)'}`,
                            background: it.hecho ? it.color : 'transparent',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                          }}
                        >
                          {it.hecho && <Check size={11} />}
                        </div>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            display: 'grid',
                            placeItems: 'center',
                            background: `color-mix(in oklab, ${it.color} 14%, transparent)`,
                            color: it.color,
                          }}
                        >
                          <Icono size={14} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 500,
                              textDecoration: it.hecho ? 'line-through' : 'none',
                            }}
                          >
                            {it.titulo}
                          </div>
                          <div
                            className="mono"
                            style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}
                          >
                            {it.sub}
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: '1px solid var(--line)',
                            background: 'var(--bg)',
                            color: 'var(--ink-3)',
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          ...
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          min-height: 460px;
        }
        .dashboard-sidebar {
          padding: 16px;
          border-right: 1px solid var(--line);
          background: var(--bg-soft);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        @media (max-width: 760px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-sidebar {
            display: none;
          }
        }
      `}</style>
    </MockShell>
  )
}

function SideItem({
  icono: Icono,
  label,
  count,
  activo,
  hint,
}: {
  icono: LucideIcon
  label: string
  count?: string
  activo?: boolean
  hint?: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 10,
        padding: '7px 8px',
        borderRadius: 8,
        background: activo ? 'var(--bg-elev)' : 'transparent',
        border: activo ? '1px solid var(--line)' : '1px solid transparent',
        fontSize: 12.5,
      }}
    >
      <span style={{ color: activo ? 'var(--ink)' : 'var(--ink-2)', display: 'inline-flex' }}>
        <Icono size={14} />
      </span>
      <span style={{ color: activo ? 'var(--ink)' : 'var(--ink-2)' }}>{label}</span>
      {count && (
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
          {count}
        </span>
      )}
      {hint && (
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>
          {hint}
        </span>
      )}
    </div>
  )
}

function CalendarMock() {
  const dias = Array.from({ length: 35 }, (_, i) => i - 2)
  const eventos: Record<number, { c: string; t: string }[]> = {
    3: [{ c: 'var(--cat-estudio)', t: 'Ingles' }],
    5: [{ c: 'var(--cat-cumple)', t: 'Carlos' }],
    9: [
      { c: 'var(--cat-pendientes)', t: 'Pago tarjeta' },
      { c: 'var(--cat-estudio)', t: 'Ingles' },
    ],
    12: [{ c: 'var(--cat-eventos)', t: 'Reunion' }],
    15: [
      { c: 'var(--cat-peliculas)', t: 'Dune 3' },
      { c: 'var(--cat-musica)', t: 'Concierto' },
    ],
    19: [{ c: 'var(--cat-juegos)', t: 'GTA VI' }],
    20: [
      { c: 'var(--cat-cumple)', t: 'Maria' },
      { c: 'var(--cat-eventos)', t: 'Medico' },
    ],
    22: [{ c: 'var(--cat-estudio)', t: 'Examen' }],
    25: [{ c: 'var(--cat-notas)', t: 'Diario' }],
    28: [{ c: 'var(--cat-libros)', t: 'Sapiens 2' }],
  }

  return (
    <MockShell titulo="noti.app/calendario" subtitulo="noviembre 2026">
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Noviembre 2026
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>
              12 recordatorios este mes
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {(['Peliculas', 'Cumpleanos', 'Estudio', 'Juegos'] as const).map((f, i) => (
              <span
                key={f}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 99,
                    background: [
                      'var(--cat-peliculas)',
                      'var(--cat-cumple)',
                      'var(--cat-estudio)',
                      'var(--cat-juegos)',
                    ][i],
                  }}
                />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <div
              key={d}
              className="mono"
              style={{
                fontSize: 10.5,
                color: 'var(--ink-3)',
                padding: '6px 8px',
                letterSpacing: '0.08em',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {dias.map((d, i) => {
            const valido = d >= 1 && d <= 30
            const ev = eventos[d] ?? []
            const esHoy = d === 15
            return (
              <div
                key={i}
                style={{
                  minHeight: 78,
                  borderRadius: 10,
                  padding: 8,
                  background: esHoy
                    ? 'color-mix(in oklab, var(--ink) 4%, transparent)'
                    : valido
                      ? 'var(--bg-elev)'
                      : 'transparent',
                  border: `1px solid ${valido ? 'var(--line)' : 'transparent'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: !valido ? 'var(--ink-4)' : esHoy ? 'var(--ink)' : 'var(--ink-2)',
                    fontWeight: esHoy ? 600 : 400,
                  }}
                >
                  {valido ? d : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {ev.slice(0, 2).map((e, j) => (
                    <div
                      key={j}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 10,
                        color: 'var(--ink-2)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 99,
                          background: e.c,
                          flexShrink: 0,
                        }}
                      />
                      {e.t}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MockShell>
  )
}

interface ResultadoBusqueda {
  icono: LucideIcon
  color: string
  titulo: string
  sub: string
  cat: string
}

function SearchMock() {
  const resultados: ResultadoBusqueda[] = [
    {
      icono: Gamepad2,
      color: 'var(--cat-juegos)',
      titulo: 'GTA VI',
      sub: 'Estreno - jue 19 nov - 06:00',
      cat: 'Juegos',
    },
    {
      icono: Cake,
      color: 'var(--cat-cumple)',
      titulo: 'Cumpleanos de Maria',
      sub: 'anual - 20 jun',
      cat: 'Cumpleanos',
    },
    {
      icono: GraduationCap,
      color: 'var(--cat-estudio)',
      titulo: 'Examen de Calculo II',
      sub: 'vie 21 nov - 09:00',
      cat: 'Estudio',
    },
    {
      icono: StickyNote,
      color: 'var(--cat-notas)',
      titulo: 'Ideas para regalo de Maria',
      sub: 'Nota - editada hace 2 dias',
      cat: 'Notas',
    },
    {
      icono: BookMarked,
      color: 'var(--cat-libros)',
      titulo: 'Sapiens vol. 2',
      sub: 'Estreno - jue 5 feb 2026',
      cat: 'Libros',
    },
  ]

  return (
    <MockShell titulo="noti.app - Ctrl+K" subtitulo="busqueda global">
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: '60px 24px',
          minHeight: 460,
          background: 'color-mix(in oklab, var(--ink) 30%, transparent)',
        }}
      >
        <div className="card-landing" style={{ width: '100%', maxWidth: 560 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 18px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <Search size={18} style={{ color: 'var(--ink-3)' }} />
            <input
              readOnly
              value="maria"
              style={{
                flex: 1,
                border: 0,
                outline: 0,
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: 16,
                fontFamily: 'inherit',
              }}
            />
            <span
              className="mono"
              style={{
                fontSize: 10.5,
                color: 'var(--ink-3)',
                padding: '3px 8px',
                border: '1px solid var(--line)',
                borderRadius: 6,
              }}
            >
              ESC
            </span>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10.5,
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '10px 18px 4px',
            }}
          >
            {resultados.length} resultados - 142 ms
          </div>
          <div style={{ padding: '4px 8px 10px' }}>
            {resultados.map((r, i) => {
              const Icono = r.icono
              return (
                <div
                  key={r.titulo}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 9,
                    background: i === 0 ? 'var(--bg-soft)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      display: 'grid',
                      placeItems: 'center',
                      background: `color-mix(in oklab, ${r.color} 14%, transparent)`,
                      color: r.color,
                    }}
                  >
                    <Icono size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.titulo}</div>
                    <div
                      className="mono"
                      style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}
                    >
                      {r.sub}
                    </div>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 8px',
                      borderRadius: 99,
                      background: `color-mix(in oklab, ${r.color} 12%, transparent)`,
                      color: r.color,
                    }}
                  >
                    {r.cat}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </MockShell>
  )
}
