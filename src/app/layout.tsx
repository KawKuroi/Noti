import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { RegistrarSW } from '@/components/features/registrar-sw'
import { ProvedorTema } from '@/components/providers/proveedor-tema'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

// Mono real para las etiquetas tecnicas de la landing (.mono, .eyebrow);
// la app interna sigue usando la sans (ver --font-mono en globals.css).
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500'],
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
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.svg', type: 'image/svg+xml' },
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

// Layout raiz estatico: la lectura de cookies de next-intl vive en el layout
// del dashboard (unico lugar con textos traducidos) para que las paginas
// publicas puedan prerenderizarse. El lang real lo ajusta AjustarLang alli.
export default function LayoutRaiz({ children }: Props) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <ProvedorTema>
          <RegistrarSW />
          {children}
          <Toaster richColors position="top-right" />
        </ProvedorTema>
      </body>
    </html>
  )
}
