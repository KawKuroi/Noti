import { FAQS } from './data'

// Datos estructurados schema.org para la landing (server component).
// WebApplication describe el producto; FAQPage reutiliza las FAQs de data.ts
// (unica fuente de verdad) y habilita rich results en Google.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const esquemaApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Noti',
  url: APP_URL,
  description:
    'Recordatorios con IA y notificaciones push reales: estrenos de peliculas, series, videojuegos, musica y libros, cumpleanos, estudio y tareas. En espanol, gratis y open source.',
  downloadUrl: 'https://github.com/KawKuroi/Noti/releases',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, Android, Windows',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Notificaciones push nativas (Web Push + VAPID)',
    'Asistente IA por lenguaje natural y voz',
    'Fechas de lanzamientos verificadas (TMDB, RAWG, MusicBrainz, Google Books)',
    'Calendario mensual y semanal',
    'Notas con adjuntos multimedia',
    'PWA instalable sin tiendas de apps',
  ],
}

const esquemaFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.pregunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.respuesta,
    },
  })),
}

// Escapa "<" para impedir cierre prematuro del tag script (hardening estandar
// para JSON-LD inyectado; el contenido es estatico, sin input de usuario).
function serializar(datos: object): string {
  return JSON.stringify(datos).replace(/</g, '\\u003c')
}

export function DatosEstructurados() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializar(esquemaApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializar(esquemaFAQ) }}
      />
    </>
  )
}
