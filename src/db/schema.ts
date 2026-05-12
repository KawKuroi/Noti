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
    fechaVencimiento: timestamp('due_date', { withTimezone: true }).notNull(),
    notificarEn: timestamp('notify_at', { withTimezone: true }).notNull(),
    esRecurrente: boolean('is_recurring').default(false).notNull(),
    reglaRecurrencia: text('recurrence_rule'),
    estaCompletado: boolean('is_completed').default(false).notNull(),
    tmdbId: integer('tmdb_id'),
    metadatos: jsonb('metadata'),
    creadoEn: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    actualizadoEn: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (tabla) => ({
    idxUsuarioId: index('idx_reminders_user_id').on(tabla.usuarioId),
    idxNotificarEn: index('idx_reminders_notify_at').on(tabla.notificarEn),
    idxCategoria: index('idx_reminders_category').on(tabla.categoriaId),
    idxFechaVencimiento: index('idx_reminders_due_date').on(tabla.fechaVencimiento),
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
  enviadoEn: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  mensajeError: text('error_message'),
})
