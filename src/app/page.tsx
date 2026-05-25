import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FormularioSugerencias } from '@/components/features/formulario-sugerencias'
import {
  Bell,
  Film,
  Tv,
  Gamepad2,
  Music,
  BookMarked,
  BookOpen,
  StickyNote,
  Cake,
  CheckSquare,
  MapPin,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Calendar,
  Github,
  Moon,
  Mic,
  Paperclip,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Noti - Recordatorios inteligentes',
  description: 'Recordatorios inteligentes para todo lo que importa. Notificaciones push reales, chat IA para lanzamientos y calendario en una sola PWA.',
}

const LANZAMIENTOS = [
  { icono: Film, nombre: 'Peliculas', descripcion: 'El chat IA busca fechas exactas de estrenos en TMDB y te notifica el dia del lanzamiento.', color: '#0A0A0A' },
  { icono: Tv, nombre: 'Series', descripcion: 'Sigue temporadas y episodios. Recibe push el dia que sale el episodio en tu plataforma.', color: '#2563EB' },
  { icono: Gamepad2, nombre: 'Videojuegos', descripcion: 'Busqueda de fechas de lanzamiento via RAWG.io para todas las plataformas.', color: '#16A34A' },
  { icono: Music, nombre: 'Musica', descripcion: 'Albums y singles via MusicBrainz sin necesidad de API key.', color: '#DC2626' },
  { icono: BookMarked, nombre: 'Libros', descripcion: 'Fechas de publicacion consultadas en Google Books automaticamente.', color: '#7C3AED' },
]

const PERSONALES = [
  { icono: BookOpen, nombre: 'Estudio', descripcion: 'Sesiones de estudio y clases con recurrencia semanal configurable.', color: '#0284C7' },
  { icono: Cake, nombre: 'Cumpleanos', descripcion: 'Recordatorios anuales automaticos con push a 3 dias y 1 dia de anticipacion.', color: '#DB2777' },
  { icono: CheckSquare, nombre: 'Pendientes', descripcion: 'Lista de tareas con prioridad baja, media o alta y auto-eliminacion al completar.', color: '#D97706' },
  { icono: MapPin, nombre: 'Eventos', descripcion: 'Eventos con ubicacion. Llega a tiempo a donde necesitas estar.', color: '#DC2626' },
  { icono: StickyNote, nombre: 'Notas', descripcion: 'Cuadernos tipo chat con adjuntos: imagenes, audios, documentos y videos.', color: '#6366F1' },
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
    descripcion: 'El asistente solo reporta fechas de fuentes verificadas (TMDB, RAWG, MusicBrainz, Google Books). Si no la encuentra, te pide la fecha manualmente.',
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
  {
    icono: Moon,
    titulo: 'Dark mode',
    descripcion: 'Tema oscuro completo con tokens CSS semanticos. Tu preferencia se guarda automaticamente.',
  },
  {
    icono: Mic,
    titulo: 'Entrada por voz',
    descripcion: 'Dicta tus recordatorios. Whisper Large v3 Turbo (Groq) transcribe el audio al instante.',
  },
  {
    icono: Paperclip,
    titulo: 'Notas con adjuntos',
    descripcion: 'Adjunta imagenes, audios, PDFs y videos directamente en tus cuadernos de notas.',
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
  {
    pregunta: 'Puedo usar Noti en modo oscuro?',
    respuesta: 'Si. Noti incluye dark mode completo y guarda tu preferencia automaticamente. Puedes cambiarlo desde Configuracion.',
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
            Noti unifica tus recordatorios con notificaciones push reales y un chat IA que busca fechas exactas de peliculas, series, videojuegos, albumes y libros.
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
            <a
              href="https://github.com/KawKuroi/Noti"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Github size={16} />
              Ver en GitHub
            </a>
          </div>
        </section>

        {/* Capturas */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Image
              src="/screenshots/inicio.png"
              alt="Dashboard de recordatorios"
              width={800}
              height={500}
              className="rounded-xl border border-gray-200 w-full"
            />
            <Image
              src="/screenshots/calendario.png"
              alt="Vista de calendario"
              width={800}
              height={500}
              className="rounded-xl border border-gray-200 w-full"
            />
            <Image
              src="/screenshots/chat-lanzamientos.png"
              alt="Chat IA de lanzamientos"
              width={800}
              height={500}
              className="rounded-xl border border-gray-200 w-full"
            />
          </div>
        </section>

        {/* Categorias */}
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              10 categorias, una sola app
            </h2>
            <p className="text-gray-500 text-center mb-10">
              Cada categoria tiene campos y comportamiento adaptado a su tipo.
            </p>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Lanzamientos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {LANZAMIENTOS.map((cat) => {
                const Icono = cat.icono
                return (
                  <div
                    key={cat.nombre}
                    className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
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

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Personales</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {PERSONALES.map((cat) => {
                const Icono = cat.icono
                return (
                  <div
                    key={cat.nombre}
                    className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
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
                  Powered by Groq Llama 3.3 70B
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chat IA para agendar lanzamientos
                </h2>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  Pregunta en lenguaje natural: &ldquo;cuando sale GTA 6&rdquo;, &ldquo;nuevo album de Bad Bunny&rdquo; o &ldquo;Avatar 3&rdquo;. El asistente busca la fecha exacta y te pide confirmar antes de agendar.
                </p>
                <ul className="space-y-2">
                  {[
                    'Peliculas y series via TMDB con preferencia regional',
                    'Videojuegos via RAWG.io',
                    'Albums via MusicBrainz (sin API key)',
                    'Libros via Google Books (sin API key)',
                    'Anti-alucinacion: si no encuentra la fecha, te la pide manualmente',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 mt-0.5">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Image
                  src="/screenshots/chat-lanzamientos.png"
                  alt="Chat de lanzamientos"
                  width={600}
                  height={400}
                  className="w-full"
                />
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Sugerencias */}
        <section className="border-t border-gray-100 py-16">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Tienes una sugerencia?
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Noti es un proyecto en desarrollo. Tu feedback ayuda a decidir que construir.
            </p>
            <FormularioSugerencias />
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
          <p className="flex items-center gap-2">
            Noti — proyecto de portafolio de codigo abierto.
            <a
              href="https://github.com/KawKuroi/Noti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-gray-600 underline"
            >
              <Github size={11} />
              GitHub
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span>
              Peliculas y series:{' '}
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
