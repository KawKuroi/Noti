import type { Metadata } from 'next'
import { AIDemo } from '@/components/landing/ai-demo'
import { AppPreview } from '@/components/landing/app-preview'
import { Categories } from '@/components/landing/categories'
import { Features } from '@/components/landing/features'
import { Footer, FooterCTA } from '@/components/landing/footer-cta'
import { FAQ } from '@/components/landing/faq'
import { Hero } from '@/components/landing/hero'
import { Nav } from '@/components/landing/nav'
import { RevealRunner } from '@/components/landing/reveal-runner'
import { RecoveryToast } from '@/components/features/recovery-toast'

export const metadata: Metadata = {
  title: 'Noti - Recordatorios inteligentes',
  description:
    'Recordatorios inteligentes para todo lo que importa. Notificaciones push reales, chat IA para lanzamientos y calendario en una sola PWA.',
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function PaginaLanding({ searchParams }: Props) {
  const { error } = await searchParams
  return (
    <div className="landing-root">
      <RecoveryToast error={error} />
      <Nav />
      <main>
        <Hero />
        <Features />
        <Categories />
        <AIDemo />
        <AppPreview />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
      <RevealRunner />
    </div>
  )
}
