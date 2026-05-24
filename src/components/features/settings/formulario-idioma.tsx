'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  localeActual: string
}

export function FormularioIdioma({ localeActual }: Props) {
  const router = useRouter()
  const t = useTranslations('Settings')

  function cambiarIdioma(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
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
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            localeActual === op.valor
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
          }`}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  )
}
