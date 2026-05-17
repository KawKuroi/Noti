import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Bell,
  Film,
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Calendar,
  Timer,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Noti - Recordatorios inteligentes',
  description: 'Recordatorios inteligentes para todo lo que importa. Notificaciones push reales, chat IA para lanzamientos, pomodoro y calendario en una sola PWA.',
}

const CATEGORIAS = [
  { icono: Film, nombre: 'Peliculas y series', descripcion: 'El chat IA busca fechas exactas de estrenos en TMDB y te notifica el dia del lanzamiento.', color: '#7C3AED' },
  { icono: BookOpen, nombre: 'Estudio', descripcion: 'Sesiones de trabajo con temporizador pomodoro integrado. Nunca mas olvides estudiar.', color: '#0284C7' },
  { icono: CalendarDays, nombre: 'Clases', descripcion: 'Horarios recurrentes semanales. Configura una vez, recibe el aviso cada semana.', color: '#059669' },
  { icono: Cake, nombre: 'Cumpleanos', descripcion: 'Recordatorios anuales automaticos para que nunca olvides felicitar a alguien.', color: '#DB2777' },
  { icono: CheckSquare, nombre: 'Tareas', descripcion: 'Lista de pendientes con prioridad baja, media o alta y fecha limite.', color: '#D97706' },
  { icono: MapPin, nombre: 'Eventos', descripcion: 'Eventos con ubicacion. Llega a tiempo a donde necesitas estar.', color: '#DC2626' },
]

const BENEFICIOS = [
  {
    icono: Smartphone,
    titulo: 'Push real en tu celular',
    descripcion: 'Sin apps de mensajeria. Notificaciones nativas en Android y Windows directamente desde el navegador.',
  },
  {
    icono: Sparkles,
    titulo: 'Chat IA contra alucinaciones',
    descripcion: 'El asistente solo reporta fechas de fuentes verificadas (TMDB, RAWG, MusicBrainz). Si no la encuentra, te pide la fecha manualmente.',
  },
  {
    icono: Timer,
    titulo: 'Pomodoro integrado',
    descripcion: 'Inicia un temporizador 25/5 min directamente desde tu recordatorio de estudio. Notificacion push al terminar cada sesion.',
  },
  {
    icono: Calendar,
    titulo: 'Vista de calendario',
    descripcion: 'Todos tus recordatorios en vistas mensual y semanal con puntos de color por categoria.',
  },
  {
    icono: ShieldCheck,
    titulo: 'Tus datos, solo tuyos',
    descripcion: 'Row Level Security en Supabase garantiza que nadie mas puede ver tus recordatorios.',
  },
  {
    icono: Bell,
    titulo: 'Acciones desde la notificacion',
    descripcion: 'Ver, posponer 15 min o completar directamente desde la notificacion sin abrir la app.',
  },
]

const FAQS = [
  {
    pregunta: 'Es gratis?',
    respuesta: 'Si. Noti es un proyecto de portafolio de codigo abierto. Puedes usarlo de forma gratuita o clonarlo y desplegarlo con tu propia cuenta de Supabase y Vercel.',
  },
  {
    pregunta: 'Recibo notificaciones en mi celular?',
    respuesta: 'Si, en Android con Chrome y en Windows con Chrome o Edge. Solo necesitas instalar la PWA (o permitir notificaciones desde el navegador) una vez.',
  },
  {
    pregunta: 'Necesito instalar algo desde una tienda de apps?',
    respuesta: 'No. Noti es una PWA. La instalas desde Chrome tocando "Agregar a pantalla de inicio" o el icono de instalacion en la barra de direcciones.',
  },
  {
    pregunta: 'Que pasa si el chat IA no encuentra la fecha de un lanzamiento?',
    respuesta: 'El asistente te pide la fecha manualmente en lugar de inventarla. Asi garantizas que el recordatorio tiene la fecha correcta.',
  },
]

export default function PaginaLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">Noti</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
            PWA gratuita
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
            Recordatorios que llegan a tiempo.{' '}
            <span className="text-gray-400">En cualquier dispositivo.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Noti unifica tus recordatorios con notificaciones push reales y un chat IA que busca fechas exactas de peliculas, series, videojuegos y albumes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Empezar gratis
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        {/* Capturas placeholder */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Dashboard', 'Calendario', 'Chat de lanzamientos', 'Pomodoro'].map((label) => (
              <div
                key={label}
                className="aspect-video bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center"
              >
                <span className="text-xs text-gray-400 text-center px-2">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Categorias */}
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              6 categorias, una sola app
            </h2>
            <p className="text-gray-500 text-center mb-10">
              Cada categoria tiene campos y comportamiento adaptado a su tipo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIAS.map((cat) => {
                const Icono = cat.icono
                return (
                  <div
                    key={cat.nombre}
                    className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}18` }}
                    >
                      <Icono size={18} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{cat.nombre}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cat.descripcion}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Chat IA */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full mb-4">
                  <Sparkles size={12} />
                  Powered by Google Gemini 2.0 Flash
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chat IA para agendar lanzamientos
                </h2>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  Pregunta en lenguaje natural: &ldquo;cuando sale GTA 6&rdquo;, &ldquo;nuevo album de Bad Bunny&rdquo; o &ldquo;Avatar 3&rdquo;. El asistente busca la fecha exacta en TMDB, RAWG y MusicBrainz y te pide confirmar antes de agendar.
                </p>
                <ul className="space-y-2">
                  {[
                    'Peliculas y series via TMDB con preferencia regional',
                    'Videojuegos via RAWG.io',
                    'Albums via MusicBrainz (sin API key)',
                    'Anti-alucinacion: si no encuentra la fecha, te la pide manualmente',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 mt-0.5">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 aspect-video flex items-center justify-center">
                <span className="text-sm text-gray-400">Captura del chat de lanzamientos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              Todo lo que incluye
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFICIOS.map((b) => {
                const Icono = b.icono
                return (
                  <div key={b.titulo} className="space-y-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Icono size={16} className="text-gray-700" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{b.titulo}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{b.descripcion}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Preguntas frecuentes
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.pregunta}
                  className="group border border-gray-200 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors list-none">
                    {faq.pregunta}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-base leading-none">
                      &#8964;
                    </span>
                  </summary>
                  <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                    {faq.respuesta}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-gray-100 py-16 text-center">
          <div className="max-w-xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Empieza ahora, es gratis
            </h2>
            <p className="text-gray-500 mb-8">
              Sin tarjeta de credito. Sin limite de recordatorios.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>Noti — proyecto de portafolio de codigo abierto.</p>
          <div className="flex items-center gap-4">
            <span>
              Datos de peliculas y series:{' '}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 underline"
              >
                TMDB
              </a>
            </span>
            <span>
              Videojuegos:{' '}
              <a
                href="https://rawg.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 underline"
              >
                RAWG
              </a>
            </span>
            <span>
              Musica:{' '}
              <a
                href="https://musicbrainz.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 underline"
              >
                MusicBrainz
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
