import { ImageResponse } from 'next/og'

// Imagen Open Graph generada en build/request via convencion de archivo de Next.
// Reemplaza al /og-image.png estatico que la metadata referenciaba sin existir.
// Twitter/X usa og:image como fallback cuando no hay twitter:image explicita.

export const alt = 'Noti — Recordatorios inteligentes con notificaciones push reales'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CATEGORIAS = ['Peliculas', 'Series', 'Juegos', 'Musica', 'Libros', 'Cumpleanos', 'Pendientes']

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          color: '#fafafa',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#fafafa',
              color: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 600 }}>Noti</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 600, lineHeight: 1.02 }}>
            Recuerda lo que importa.
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#a3a3a3' }}>
            Recordatorios con IA y notificaciones push reales. Gratis, para siempre.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {CATEGORIAS.map((cat) => (
            <div
              key={cat}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '1px solid #333333',
                color: '#d4d4d4',
                fontSize: 22,
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
