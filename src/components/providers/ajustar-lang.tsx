'use client'

import { useEffect } from 'react'

// El layout raiz es estatico con lang="es"; cuando el usuario del dashboard
// usa otro idioma, sincronizamos el atributo en el cliente.
export function AjustarLang({ locale }: { locale: string }) {
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
