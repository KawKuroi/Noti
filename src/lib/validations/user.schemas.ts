import { z } from 'zod'

const ZONAS_HORARIAS_LATAM = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Buenos_Aires',
  'America/Lima',
  'America/Santiago',
  'America/Caracas',
  'America/Guayaquil',
  'America/La_Paz',
  'America/Asuncion',
  'America/Montevideo',
  'America/Panama',
  'America/Costa_Rica',
  'America/Guatemala',
  'America/Tegucigalpa',
  'America/Managua',
  'America/El_Salvador',
  'America/Havana',
  'America/Santo_Domingo',
  'America/Puerto_Rico',
  'Europe/Madrid',
  'UTC',
]

export const esquemaPerfil = z.object({
  nombreMostrado: z
    .string()
    .trim()
    .min(1, 'El nombre es requerido')
    .max(60, 'Maximo 60 caracteres')
    .nullable()
    .optional(),
  zonaHoraria: z.enum(ZONAS_HORARIAS_LATAM as [string, ...string[]], {
    error: 'Zona horaria invalida',
  }),
})

export type EntradaPerfil = z.infer<typeof esquemaPerfil>
export { ZONAS_HORARIAS_LATAM }
