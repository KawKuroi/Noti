'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { cambiarIdiomaAction } from '@/app/(dashboard)/settings/actions'

interface Props {
  localeActual: string
}

export function FormularioIdioma({ localeActual }: Props) {
  const [pending, startTransition] = useTransition()
  const t = useTranslations('Settings')

  function cambiarIdioma(locale: string) {
    startTransition(() => {
      void cambiarIdiomaAction(locale)
    })
  }

  const opciones = [
    { valor: 'es', etiqueta: t('espanol') },
    { valor: 'en', etiqueta: t('ingles') },
  ]

  return (
    <div className="flex gap-2">
      {opciones.map((op) => (
        <button
          key={op.valor}
          type="button"
          onClick={() => cambiarIdioma(op.valor)}
          disabled={pending}
          className={`px-4 py-2 rounded-[10px] text-sm font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            localeActual === op.valor
              ? 'bg-(--ink) text-(--bg) border-(--ink)'
              : 'border-(--line-2) text-(--ink-3) hover:border-(--ink) hover:text-(--ink)'
          }`}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  )
}
