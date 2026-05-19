import { z } from 'zod'

export const esquemaSuscripcionPush = z.object({
  endpoint: z.string().url('Endpoint invalido'),
  p256dh: z.string().min(1, 'Clave p256dh requerida'),
  auth: z.string().min(1, 'Token auth requerido'),
  nombreDispositivo: z.string().max(100).optional(),
})

export const esquemaAnticipacion = z.object({
  minutos: z.coerce.number().int().min(0).max(1440),
})

export const esquemaAccionNotificacion = z.object({
  reminderId: z.string().uuid('ID de recordatorio invalido'),
  action: z.enum(['posponer', 'completar']),
  minutos: z.coerce.number().int().positive().optional(),
})

export type SuscripcionPushInput = z.infer<typeof esquemaSuscripcionPush>
export type AccionNotificacionInput = z.infer<typeof esquemaAccionNotificacion>
