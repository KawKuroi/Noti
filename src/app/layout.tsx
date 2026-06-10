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
// Description entre 110-160 caracteres: Google corta alrededor de 160.
const TITULO = 'Noti — Recordatorios con IA y notificaciones que sí llegan'
const DESCRIPCION =
  'Agenda recordatorios en lenguaje natural y recibe notificaciones push reales: estrenos, cumpleanos, estudio y tareas. Gratis y open source.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: TITULO,
    template: '%s | Noti',
  },
  description: DESCRIPCION,
  manifest: '/manifest.json',
  icons: {
    // Google no soporta favicons SVG: el .ico multirresolucion es obligatorio
    // para que el icono aparezca en los resultados de busqueda.
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/icons/icon-180.png',
  },
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
    url: '/',
    locale: 'es_CO',
    siteName: 'Noti',
    title: TITULO,
    description: DESCRIPCION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
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
