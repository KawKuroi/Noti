import type { Metadata } from 'next'

// La pagina es client component ('use client') y no puede exportar metadata;
// este layout de ruta aporta title/canonical propios para SEO.
export const metadata: Metadata = {
  title: 'Crear cuenta gratis',
  description:
    'Crea tu cuenta gratuita de Noti y empieza a recibir notificaciones push de estrenos, cumpleanos y tareas. Sin tarjeta, sin anuncios.',
  alternates: { canonical: '/register' },
}

interface Props {
  children: React.ReactNode
}

export default function LayoutRegister({ children }: Props) {
  return children
}
