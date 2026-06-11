import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Categories } from '@/components/landing/categories'
import { Descargas } from '@/components/landing/descargas'
import { Features } from '@/components/landing/features'
import { Footer, FooterCTA } from '@/components/landing/footer-cta'
import { Hero } from '@/components/landing/hero'
import { Nav } from '@/components/landing/nav'
import { RevealRunner } from '@/components/landing/reveal-runner'
import { DatosEstructurados } from '@/components/landing/datos-estructurados'
import { RecoveryToast } from '@/components/features/recovery-toast'
import { obtenerEnlacesDescarga } from '@/lib/services/github-releases.service'

// Secciones cliente bajo el fold: import dinamico para sacarlas del bundle
// JS inicial (el HTML se sigue renderizando en el servidor).
const AIDemo = dynamic(() => import('@/components/landing/ai-demo').then((m) => m.AIDemo))
const AppPreview = dynamic(() =>
  import('@/components/landing/app-preview').then((m) => m.AppPreview),
)
const FAQ = dynamic(() => import('@/components/landing/faq').then((m) => m.FAQ))

// El title cae al default del layout (marca completa, sin duplicar "| Noti").
export const metadata: Metadata = {
  description:
    'Agenda recordatorios en lenguaje natural y recibe notificaciones push reales: estrenos, cumpleanos, estudio y tareas. Gratis y open source.',
  alternates: { canonical: '/' },
}

// Pagina estatica/ISR: sin searchParams (RecoveryToast los lee en el cliente
// dentro de Suspense) y el fetch de releases revalida cada hora.
export default async function PaginaLanding() {
  const enlaces = await obtenerEnlacesDescarga()
  return (
    <div className="landing-root">
      <DatosEstructurados />
      <RecoveryToast />
      <Nav />
      <main>
        <Hero />
        <Features />
        <Categories />
        <AIDemo />
        <AppPreview />
        <Descargas enlaces={enlaces} />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
      <RevealRunner />
    </div>
  )
}
