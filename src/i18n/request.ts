import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const LOCALES_VALIDOS = ['es', 'en'] as const
type Locale = (typeof LOCALES_VALIDOS)[number]

function esLocaleValido(valor: string | undefined): valor is Locale {
  return LOCALES_VALIDOS.includes(valor as Locale)
}

export default getRequestConfig(async () => {
  const jarCookies = await cookies()
  const valor = jarCookies.get('NEXT_LOCALE')?.value
  const locale: Locale = esLocaleValido(valor) ? valor : 'es'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
