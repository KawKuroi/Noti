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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Noti - Recordatorios inteligentes',
    template: '%s',
  },
  description: 'Recordatorios inteligentes para todo lo que importa. Notificaciones push reales, chat IA para lanzamientos y calendario en una sola PWA.',
  manifest: '/manifest.json',
  keywords: ['recordatorios', 'notificaciones push', 'PWA', 'calendario', 'chat IA'],
  authors: [{ name: 'Noti' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Noti',
    title: 'Noti - Recordatorios inteligentes',
    description: 'Recordatorios inteligentes para todo lo que importa. Notificaciones push reales, chat IA para lanzamientos y calendario en una sola PWA.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Noti - Recordatorios inteligentes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noti - Recordatorios inteligentes',
    description: 'Recordatorios inteligentes para todo lo que importa.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Noti',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
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
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
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
