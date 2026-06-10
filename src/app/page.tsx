import type { Metadata } from 'next'
import { AIDemo } from '@/components/landing/ai-demo'
import { AppPreview } from '@/components/landing/app-preview'
import { Categories } from '@/components/landing/categories'
import { Descargas } from '@/components/landing/descargas'
import { Features } from '@/components/landing/features'
import { Footer, FooterCTA } from '@/components/landing/footer-cta'
import { FAQ } from '@/components/landing/faq'
import { Hero } from '@/components/landing/hero'
import { Nav } from '@/components/landing/nav'
import { RevealRunner } from '@/components/landing/reveal-runner'
import { DatosEstructurados } from '@/components/landing/datos-estructurados'
import { RecoveryToast } from '@/components/features/recovery-toast'
import { obtenerEnlacesDescarga } from '@/lib/services/github-releases.service'

// El title cae al default del layout (marca completa, sin duplicar "| Noti").
export const metadata: Metadata = {
  description:
    'Agenda recordatorios en lenguaje natural y recibe notificaciones push reales: estrenos, cumpleanos, estudio y tareas. Gratis y open source.',
  alternates: { canonical: '/' },
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function PaginaLanding({ searchParams }: Props) {
  const [{ error }, enlaces] = await Promise.all([searchParams, obtenerEnlacesDescarga()])
  return (
    <div className="landing-root">
      <DatosEstructurados />
      <RecoveryToast error={error} />
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
