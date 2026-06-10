import type { Metadata } from 'next'

// La pagina es client component ('use client') y no puede exportar metadata;
// este layout de ruta aporta title/canonical propios para SEO.
export const metadata: Metadata = {
  title: 'Iniciar sesion',
  description:
    'Accede a tu cuenta de Noti para gestionar tus recordatorios, lanzamientos y notificaciones push.',
  alternates: { canonical: '/login' },
}

interface Props {
  children: React.ReactNode
}

export default function LayoutLogin({ children }: Props) {
  return children
}
