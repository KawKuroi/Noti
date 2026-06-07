import {
  pgTable,
  uuid,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const perfiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  nombreMostrado: text('display_name'),
  zonaHoraria: text('timezone').default('America/Bogota').notNull(),
  anticipacionNotificacion: integer('notification_advance').default(15).notNull(),
  resumenDiario: boolean('daily_summary').default(false).notNull(),
  horaResumen: text('summary_hour').default('07:00').notNull(),
  autoEliminarTareasCompletadasDias: integer('auto_delete_completed_tasks_days'),
  autoEliminarVencidosDias: integer('auto_delete_overdue_days'),
  eliminadoEn: timestamp('deleted_at', { withTimezone: true }),
  creadoEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  actualizadoEn: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const categorias = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  nombre: text('name').notNull(),
  icono: text('icon').notNull(),
  color: text('color').notNull(),
  creadaEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const recordatorios = pgTable(
  'reminders',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    usuarioId: uuid('user_id')
      .notNull()
      .references(() => perfiles.id, { onDelete: 'cascade' }),
    categoriaId: integer('category_id')
      .notNull()
      .references(() => categorias.id),
    titulo: text('title').notNull(),
    descripcion: text('description'),
    fechaVencimiento: timestamp('due_date', { withTimezone: true }),
    notificarEn: timestamp('notify_at', { withTimezone: true }),
    esRecurrente: boolean('is_recurring').default(false).notNull(),
    reglaRecurrencia: text('recurrence_rule'),
    estaCompletado: boolean('is_completed').default(false).notNull(),
    completadoEn: timestamp('completed_at', { withTimezone: true }),
    tmdbId: integer('tmdb_id'),
    metadatos: jsonb('metadata'),
    eliminadoEn: timestamp('deleted_at', { withTimezone: true }),
    creadoEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    actualizadoEn: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (tabla) => ({
    idxUsuarioId: index('idx_reminders_user_id').on(tabla.usuarioId),
    idxNotificarEn: index('idx_reminders_notify_at').on(tabla.notificarEn),
    idxCategoria: index('idx_reminders_category').on(tabla.categoriaId),
    idxFechaVencimiento: index('idx_reminders_due_date').on(tabla.fechaVencimiento),
    idxCompletadoEn: index('idx_reminders_completed_at').on(tabla.completadoEn),
  }),
)

export const suscripcionesPush = pgTable(
  'push_subscriptions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    usuarioId: uuid('user_id')
      .notNull()
      .references(() => perfiles.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    nombreDispositivo: text('device_name'),
    creadoEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (tabla) => ({
    idxUsuario: index('idx_push_subscriptions_user').on(tabla.usuarioId),
    unicoEndpoint: uniqueIndex('unique_user_endpoint').on(tabla.usuarioId, tabla.endpoint),
  }),
)

export const notasEntradas = pgTable(
  'note_entries',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cuadernoId: uuid('cuaderno_id')
      .notNull()
      .references(() => recordatorios.id, { onDelete: 'cascade' }),
    contenido: text('content').notNull(),
    creadoEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    actualizadoEn: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (tabla) => ({
    idxCuaderno: index('idx_note_entries_cuaderno').on(tabla.cuadernoId),
  }),
)

export const notasAdjuntos = pgTable(
  'note_attachments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cuadernoId: uuid('cuaderno_id')
      .notNull()
      .references(() => recordatorios.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull().$type<'imagen' | 'audio' | 'documento' | 'video' | 'otros'>(),
    url: text('url').notNull(),
    nombreArchivo: text('nombre_archivo').notNull(),
    mime: text('mime').notNull(),
    tamano: integer('tamano').notNull(),
    creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
  },
  (tabla) => ({
    idxAdjuntosCuaderno: index('idx_note_attachments_cuaderno').on(tabla.cuadernoId),
  }),
)

export const tokensRecuperacion = pgTable('recovery_tokens', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  usuarioId: uuid('user_id')
    .notNull()
    .references(() => perfiles.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull().$type<'cuenta' | 'recordatorios'>(),
  token: text('token').notNull().unique(),
  metadatos: jsonb('metadatos'),
  expiraEn: timestamp('expires_at', { withTimezone: true }).notNull(),
  creadoEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const logNotificaciones = pgTable('notification_log', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recordatorioId: uuid('reminder_id').references(() => recordatorios.id, {
    onDelete: 'set null',
  }),
  usuarioId: uuid('user_id')
    .notNull()
    .references(() => perfiles.id, { onDelete: 'cascade' }),
  estado: text('status').notNull(),
  titulo: text('title'),
  cuerpo: text('body'),
  leidoEn: timestamp('read_at', { withTimezone: true }),
  enviadoEn: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  mensajeError: text('error_message'),
})
