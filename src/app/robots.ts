import type { MetadataRoute } from 'next'

// Directivas para crawlers: solo las rutas publicas son indexables.
// Las rutas del dashboard viven tras auth (el middleware redirige a /login),
// pero bloquearlas aqui evita que aparezcan como "indexada sin contenido".
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: [
          '/api/',
          '/inicio',
          '/calendar',
          '/lanzamientos',
          '/notes',
          '/settings',
          '/auth/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
