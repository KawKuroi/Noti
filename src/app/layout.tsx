import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'
import { RegistrarSW } from '@/components/features/registrar-sw'
import { ProvedorTema } from '@/components/providers/proveedor-tema'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

// La imagen OG/Twitter la genera src/app/opengraph-image.tsx (convencion de
// archivo de Next) — no se declara en images[] para evitar referencias rotas.
const DESCRIPCION =
  'Agenda recordatorios con IA y recibe notificaciones push reales: estrenos de peliculas, series, videojuegos, musica y libros, cumpleanos, estudio y tareas. Gratis y open source.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Noti — Recordatorios inteligentes con notificaciones push',
    template: '%s | Noti',
  },
  description: DESCRIPCION,
  manifest: '/manifest.json',
  keywords: [
    'recordatorios',
    'notificaciones push',
    'recordatorio de cumpleanos',
    'estrenos de peliculas',
    'lanzamientos de videojuegos',
    'asistente IA',
    'PWA',
    'calendario',
  ],
  authors: [{ name: 'Noti' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Noti',
    title: 'Noti — Recordatorios inteligentes con notificaciones push',
    description: DESCRIPCION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noti — Recordatorios inteligentes con notificaciones push',
    description: 'Recordatorios con IA y push reales. Gratis, para siempre.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Noti',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

interface Props {
  children: React.ReactNode
}

export default async function LayoutRaiz({ children }: Props) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={geist.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ProvedorTema>
            <RegistrarSW />
            {children}
            <Toaster richColors position="top-right" />
          </ProvedorTema>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
