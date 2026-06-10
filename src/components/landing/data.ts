import type { ComponentType } from 'react'
import {
  Bell,
  BookMarked,
  BookOpen,
  Briefcase,
  Cake,
  Calendar,
  CheckSquare,
  Film,
  Gamepad2,
  GraduationCap,
  MapPin,
  Mic,
  Moon,
  Music,
  Paperclip,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  StickyNote,
  Tv,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type IconoLucide = LucideIcon
export type IconoComponente = ComponentType<{ className?: string; size?: number }>

export interface Beneficio {
  icono: IconoComponente
  titulo: string
  descripcion: string
  etiqueta: string
}

export const BENEFICIOS: Beneficio[] = [
  {
    icono: Smartphone,
    titulo: 'Push real en tu celular',
    descripcion:
      'Sin apps de mensajeria. Notificaciones nativas en Android y Windows directamente desde el navegador con Web Push y VAPID.',
    etiqueta: 'Notificaciones',
  },
  {
    icono: Sparkles,
    titulo: 'Chat IA contra alucinaciones',
    descripcion:
      'El asistente solo reporta fechas de fuentes verificadas (TMDB, RAWG, MusicBrainz, Google Books). Si no la encuentra, te pide la fecha manualmente.',
    etiqueta: 'Asistente',
  },
  {
    icono: Calendar,
    titulo: 'Vista de calendario',
    descripcion:
      'Vistas mensual y semanal con puntos de color por categoria. Filtro multi-select y click en dia para detalle.',
    etiqueta: 'Vista',
  },
  {
    icono: ShieldCheck,
    titulo: 'Tus datos, solo tuyos',
    descripcion:
      'Row Level Security en Supabase garantiza que nadie mas puede ver tus recordatorios. Codigo publico y auditable.',
    etiqueta: 'Privacidad',
  },
  {
    icono: Bell,
    titulo: 'Acciones desde la notificacion',
    descripcion:
      'Ver, posponer 15 minutos o completar directamente desde la notificacion del sistema sin abrir la app.',
    etiqueta: 'Push',
  },
  {
    icono: Moon,
    titulo: 'Dark mode',
    descripcion:
      'Tema oscuro completo con tokens CSS semanticos. Tu preferencia se guarda automaticamente entre sesiones.',
    etiqueta: 'Apariencia',
  },
  {
    icono: Mic,
    titulo: 'Entrada por voz',
    descripcion:
      'Dicta tus recordatorios. Whisper Large v3 Turbo (Groq) transcribe el audio al instante y el asistente lo agenda.',
    etiqueta: 'Voz',
  },
  {
    icono: Paperclip,
    titulo: 'Notas con adjuntos',
    descripcion:
      'Adjunta imagenes, audios, PDFs y videos directamente en tus cuadernos de notas tipo chat.',
    etiqueta: 'Notas',
  },
]

export interface CategoriaLanding {
  slug: string
  nombre: string
  color: string
  icono: IconoComponente
  hint: string
  descripcion: string
  ejemplo: { titulo: string; fecha: string }
}

export const CATEGORIAS_LANDING: CategoriaLanding[] = [
  {
    slug: 'movies',
    nombre: 'Peliculas',
    color: 'var(--cat-peliculas)',
    icono: Film,
    hint: 'Estrenos via TMDB',
    descripcion:
      'El chat IA busca fechas exactas de estrenos en TMDB y te notifica el dia del lanzamiento.',
    ejemplo: { titulo: 'Dune: Parte 3', fecha: 'vie 18 dic 2026 - 06:00' },
  },
  {
    slug: 'tv',
    nombre: 'Series',
    color: 'var(--cat-series)',
    icono: Tv,
    hint: 'Temporadas y especiales',
    descripcion:
      'Sigue temporadas y episodios. Recibe push el dia que sale el episodio en tu plataforma.',
    ejemplo: { titulo: 'Severance S3', fecha: 'lun 12 ene 2026' },
  },
  {
    slug: 'games',
    nombre: 'Videojuegos',
    color: 'var(--cat-juegos)',
    icono: Gamepad2,
    hint: 'Lanzamientos via RAWG',
    descripcion: 'Busqueda de fechas de lanzamiento via RAWG.io para todas las plataformas.',
    ejemplo: { titulo: 'GTA VI', fecha: 'jue 19 nov 2026 - 06:00' },
  },
  {
    slug: 'music',
    nombre: 'Musica',
    color: 'var(--cat-musica)',
    icono: Music,
    hint: 'Albums via MusicBrainz',
    descripcion: 'Albums y singles via MusicBrainz sin necesidad de API key.',
    ejemplo: { titulo: 'Tame Impala - Deadbeat', fecha: 'vie 27 mar 2026' },
  },
  {
    slug: 'books',
    nombre: 'Libros',
    color: 'var(--cat-libros)',
    icono: BookMarked,
    hint: 'Via Google Books',
    descripcion: 'Fechas de publicacion consultadas en Google Books automaticamente.',
    ejemplo: { titulo: 'Sapiens - vol. 2', fecha: 'jue 5 feb 2026' },
  },
  {
    slug: 'study',
    nombre: 'Estudio',
    color: 'var(--cat-estudio)',
    icono: BookOpen,
    hint: 'Clases y sesiones',
    descripcion: 'Sesiones de estudio y clases con recurrencia semanal configurable.',
    ejemplo: { titulo: 'Clase de ingles', fecha: 'mar 19:00 - semanal' },
  },
  {
    slug: 'birthdays',
    nombre: 'Cumpleanos',
    color: 'var(--cat-cumple)',
    icono: Cake,
    hint: 'Recurrencia anual',
    descripcion:
      'Recordatorios anuales automaticos con push a 3 dias y 1 dia de anticipacion.',
    ejemplo: { titulo: 'Cumple de Maria', fecha: 'sab 20 jun - anual' },
  },
  {
    slug: 'tasks',
    nombre: 'Pendientes',
    color: 'var(--cat-pendientes)',
    icono: CheckSquare,
    hint: 'Con fecha limite',
    descripcion:
      'Lista de tareas con prioridad baja, media o alta y auto-eliminacion al completar.',
    ejemplo: { titulo: 'Renovar pasaporte', fecha: 'vence en 6 dias' },
  },
  {
    slug: 'events',
    nombre: 'Eventos',
    color: 'var(--cat-eventos)',
    icono: MapPin,
    hint: 'Fecha y hora especifica',
    descripcion: 'Eventos con ubicacion. Llega a tiempo a donde necesitas estar.',
    ejemplo: { titulo: 'Cita medica', fecha: 'vie 15:00' },
  },
  {
    slug: 'notes',
    nombre: 'Notas',
    color: 'var(--cat-notas)',
    icono: StickyNote,
    hint: 'Cuadernos tipo chat',
    descripcion:
      'Cuadernos tipo chat con adjuntos: imagenes, audios, documentos y videos.',
    ejemplo: { titulo: 'Ideas para regalo', fecha: 'editada hace 2 dias' },
  },
]

export interface EjemploIA {
  prompt: string
  titulo: string
  fecha: string
  cat: string
  color: string
  icono: IconoComponente
  fuente: 'TMDB' | 'RAWG' | 'MusicBrainz' | 'Google Books' | 'manual'
}

export const EJEMPLOS_IA: EjemploIA[] = [
  {
    prompt: 'GTA 6 nov 19',
    titulo: 'GTA VI',
    fecha: 'jue 19 noviembre 2026 - 06:00',
    cat: 'Juegos',
    color: 'var(--cat-juegos)',
    icono: Gamepad2,
    fuente: 'RAWG',
  },
  {
    prompt: 'cumpleanos de Maria el 20 de junio',
    titulo: 'Cumpleanos de Maria',
    fecha: 'sab 20 junio - anual',
    cat: 'Cumpleanos',
    color: 'var(--cat-cumple)',
    icono: Cake,
    fuente: 'manual',
  },
  {
    prompt: 'clase de ingles los martes 7pm',
    titulo: 'Clase de ingles',
    fecha: 'mar 19:00 - semanal',
    cat: 'Estudio',
    color: 'var(--cat-estudio)',
    icono: GraduationCap,
    fuente: 'manual',
  },
  {
    prompt: 'Dune Parte 3',
    titulo: 'Dune: Parte 3',
    fecha: 'vie 18 diciembre 2026',
    cat: 'Peliculas',
    color: 'var(--cat-peliculas)',
    icono: Film,
    fuente: 'TMDB',
  },
  {
    prompt: 'nuevo album de Tame Impala',
    titulo: 'Tame Impala - Deadbeat',
    fecha: 'vie 27 marzo 2026',
    cat: 'Musica',
    color: 'var(--cat-musica)',
    icono: Music,
    fuente: 'MusicBrainz',
  },
  {
    prompt: 'renovar pasaporte en 6 dias',
    titulo: 'Renovar pasaporte',
    fecha: 'vence en 6 dias',
    cat: 'Pendientes',
    color: 'var(--cat-pendientes)',
    icono: Briefcase,
    fuente: 'manual',
  },
]

export interface EjemploHero {
  user: string
  reply: {
    titulo: string
    cat: string
    fecha: string
    color: string
    icono: IconoComponente
  }
}

export const EJEMPLOS_HERO: EjemploHero[] = [
  {
    user: 'GTA 6 nov 19',
    reply: {
      titulo: 'GTA VI',
      cat: 'Juegos',
      fecha: 'jueves 19 noviembre 2026 - 06:00',
      color: 'var(--cat-juegos)',
      icono: Gamepad2,
    },
  },
  {
    user: 'cumpleanos de Maria el 20 de junio',
    reply: {
      titulo: 'Cumpleanos de Maria',
      cat: 'Cumpleanos',
      fecha: 'sabado 20 junio - anual',
      color: 'var(--cat-cumple)',
      icono: Cake,
    },
  },
  {
    user: 'clase de ingles los martes a las 7pm',
    reply: {
      titulo: 'Clase de ingles',
      cat: 'Estudio',
      fecha: 'martes - 19:00 - semanal',
      color: 'var(--cat-estudio)',
      icono: GraduationCap,
    },
  },
  {
    user: 'cita medica el viernes a las 3pm',
    reply: {
      titulo: 'Cita medica',
      cat: 'Eventos',
      fecha: 'viernes - 15:00',
      color: 'var(--cat-eventos)',
      icono: Briefcase,
    },
  },
]

export interface PreguntaFAQ {
  pregunta: string
  respuesta: string
}

export const FAQS: PreguntaFAQ[] = [
  {
    pregunta: 'Es gratis de verdad?',
    respuesta:
      'Si, 100% gratis y sin anuncios. Es un proyecto de portafolio open source que corre en tier gratuito (Supabase, Vercel, Groq). Puedes clonarlo y desplegarlo con tus propias credenciales.',
  },
  {
    pregunta: 'Recibo notificaciones en mi celular?',
    respuesta:
      'Si, en Android con Chrome y en Windows con Chrome o Edge. Las push son nativas (Web Push con VAPID) y permiten acciones rapidas: Ver, Posponer 15 min o Completar.',
  },
  {
    pregunta: 'Necesito instalar algo desde una tienda de apps?',
    respuesta:
      'No. Es una PWA: entras desde el navegador y si quieres la instalas con un click. Y si prefieres una app nativa, hay instalador para Windows y APK para Android (descarga directa desde GitHub Releases, sin tiendas) con notificaciones exactas aunque la app este cerrada.',
  },
  {
    pregunta: 'Que pasa si el chat IA no encuentra la fecha de un lanzamiento?',
    respuesta:
      'El asistente te pide la fecha manualmente en lugar de inventarla. La logica anti-alucinacion garantiza que ningun recordatorio se agende con datos falsos.',
  },
  {
    pregunta: 'Mis datos son privados?',
    respuesta:
      'Tus recordatorios viven en tu cuenta de Supabase con Row Level Security activado en todas las tablas. Solo tu accedes a ellos. El codigo es publico, puedes auditarlo o self-hostearlo.',
  },
  {
    pregunta: 'Puedo contribuir?',
    respuesta:
      'Si. El repo esta en GitHub bajo licencia MIT. Issues, PRs y forks son bienvenidos. Tambien puedes clonar y self-hostear con tus propias credenciales si prefieres.',
  },
]

export const REPO_URL = 'https://github.com/KawKuroi/Noti'
export const REPO_NOMBRE = 'KawKuroi/Noti'
