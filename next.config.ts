import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// CSP en modo Report-Only mientras se valida que no rompe nada (Next inyecta
// scripts inline y los estilos del landing son inline). Cuando no haya
// violaciones en produccion, promover a Content-Security-Policy.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://image.tmdb.org https://media.rawg.io https://coverartarchive.org https://archive.org https://books.google.com https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.public.blob.vercel-storage.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const HEADERS_SEGURIDAD = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Microfono permitido en mismo origen: entrada por voz del asistente (Whisper)
  { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(self)' },
  { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
]

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'media.rawg.io' },
      { protocol: 'https', hostname: 'coverartarchive.org' },
      { protocol: 'https', hostname: 'archive.org' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: HEADERS_SEGURIDAD,
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default withNextIntl(config)
