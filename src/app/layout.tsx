import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RegistrarSW } from '@/components/features/registrar-sw'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Noti',
  description: 'Recordatorios inteligentes para todo lo que importa',
  manifest: '/manifest.json',
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

export default function LayoutRaiz({ children }: Props) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={inter.className}>
        <RegistrarSW />
        {children}
      </body>
    </html>
  )
}
