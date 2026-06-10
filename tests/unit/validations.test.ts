import { describe, it, expect } from 'vitest'
import {
  esquemaMetadatosClases,
  esquemaMetadatosCumpleanos,
  esquemaMetadatosEstudio,
  esquemaMetadatosTareas,
  validarRecordatorio,
} from '@/lib/validations/reminder.schemas'
import {
  esquemaSuscripcionPush,
  esquemaAnticipacion,
  esquemaAccionNotificacion,
} from '@/lib/validations/push.schemas'
import { esquemaPerfil } from '@/lib/validations/user.schemas'

describe('esquemaMetadatosClases', () => {
  it('acepta un rango horario valido', () => {
    const r = esquemaMetadatosClases.safeParse({ horaInicio: '08:00', horaFin: '10:00' })
    expect(r.success).toBe(true)
  })

  it('rechaza horaFin anterior o igual a horaInicio', () => {
    expect(esquemaMetadatosClases.safeParse({ horaInicio: '10:00', horaFin: '08:00' }).success).toBe(false)
    expect(esquemaMetadatosClases.safeParse({ horaInicio: '10:00', horaFin: '10:00' }).success).toBe(false)
  })

  it('rechaza formatos de hora invalidos', () => {
    expect(esquemaMetadatosClases.safeParse({ horaInicio: '8:00', horaFin: '10:00' }).success).toBe(false)
    expect(esquemaMetadatosClases.safeParse({ horaInicio: '25:00', horaFin: '26:00' }).success).toBe(false)
  })
})

describe('esquemaMetadatosTareas / Cumpleanos / Estudio', () => {
  it('tareas: solo prioridades del enum', () => {
    expect(esquemaMetadatosTareas.safeParse({ prioridad: 'alta' }).success).toBe(true)
    expect(esquemaMetadatosTareas.safeParse({ prioridad: 'urgente' }).success).toBe(false)
  })

  it('cumpleanos: la edad se coerciona desde string', () => {
    const r = esquemaMetadatosCumpleanos.safeParse({ edad: '30' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.edad).toBe(30)
  })

  it('cumpleanos: rechaza edades fuera de rango', () => {
    expect(esquemaMetadatosCumpleanos.safeParse({ edad: -1 }).success).toBe(false)
    expect(esquemaMetadatosCumpleanos.safeParse({ edad: 151 }).success).toBe(false)
  })

  it('estudio: duracion vacia queda undefined (campo opcional del form)', () => {
    const r = esquemaMetadatosEstudio.safeParse({ duracionMin: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.duracionMin).toBeUndefined()
  })

  it('estudio: duracion numerica en string se convierte', () => {
    const r = esquemaMetadatosEstudio.safeParse({ duracionMin: '90' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.duracionMin).toBe(90)
  })
})

describe('validarRecordatorio', () => {
  const base = {
    titulo: 'Entregar informe',
    categoriaId: '3',
    fechaVencimiento: '2026-06-20',
  }

  it('valida un recordatorio minimo y coerciona categoriaId', () => {
    const r = validarRecordatorio('tasks', { ...base, meta_prioridad: 'media' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.datos.categoriaId).toBe(3)
      expect(r.datos.esRecurrente).toBe(false)
    }
  })

  it('extrae los metadatos con prefijo meta_', () => {
    const r = validarRecordatorio('tasks', { ...base, meta_prioridad: 'alta' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.metadatos).toEqual({ prioridad: 'alta' })
  })

  it('rechaza titulo vacio', () => {
    const r = validarRecordatorio('tasks', { ...base, titulo: '', meta_prioridad: 'media' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errores.titulo).toBeDefined()
  })

  it('rechaza titulo de mas de 100 caracteres', () => {
    const r = validarRecordatorio('tasks', { ...base, titulo: 'x'.repeat(101), meta_prioridad: 'media' })
    expect(r.ok).toBe(false)
  })

  it('la fecha es requerida salvo para notas', () => {
    const sinFecha = { titulo: 'Algo', categoriaId: '3' }
    expect(validarRecordatorio('tasks', { ...sinFecha, meta_prioridad: 'media' }).ok).toBe(false)
    expect(validarRecordatorio('notes', sinFecha).ok).toBe(true)
  })

  it('notas aceptan descripcion larga (hasta 10000)', () => {
    const r = validarRecordatorio('notes', {
      titulo: 'Nota',
      categoriaId: '10',
      descripcion: 'x'.repeat(5000),
    })
    expect(r.ok).toBe(true)
  })

  it('en otras categorias la descripcion tope es 500', () => {
    const r = validarRecordatorio('tasks', {
      ...base,
      descripcion: 'x'.repeat(501),
      meta_prioridad: 'media',
    })
    expect(r.ok).toBe(false)
  })

  it('horaVencimiento vacia se normaliza a undefined', () => {
    const r = validarRecordatorio('tasks', { ...base, horaVencimiento: '', meta_prioridad: 'media' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.datos.horaVencimiento).toBeUndefined()
  })

  it('horaVencimiento con formato invalido falla', () => {
    const r = validarRecordatorio('tasks', { ...base, horaVencimiento: '9am', meta_prioridad: 'media' })
    expect(r.ok).toBe(false)
  })

  it('esRecurrente acepta el string "true" de FormData', () => {
    const r = validarRecordatorio('tasks', {
      ...base,
      esRecurrente: 'true',
      reglaRecurrencia: 'weekly:1',
      meta_prioridad: 'media',
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.datos.esRecurrente).toBe(true)
  })

  it('metadatos invalidos cortan la validacion', () => {
    const r = validarRecordatorio('tasks', { ...base, meta_prioridad: 'invalida' })
    expect(r.ok).toBe(false)
  })

  it('un slug sin schema de metadatos acepta objetos sueltos', () => {
    const r = validarRecordatorio('otra-cosa', { ...base, meta_campoLibre: 'valor' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.metadatos).toEqual({ campoLibre: 'valor' })
  })

  it('acepta FormData ademas de objetos planos', () => {
    const fd = new FormData()
    fd.set('titulo', 'Desde FormData')
    fd.set('categoriaId', '3')
    fd.set('fechaVencimiento', '2026-06-20')
    fd.set('meta_prioridad', 'baja')
    const r = validarRecordatorio('tasks', fd)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.metadatos).toEqual({ prioridad: 'baja' })
  })
})

describe('esquemaSuscripcionPush', () => {
  const valida = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
    p256dh: 'clave-p256dh',
    auth: 'token-auth',
  }

  it('acepta una suscripcion valida', () => {
    expect(esquemaSuscripcionPush.safeParse(valida).success).toBe(true)
  })

  it('rechaza un endpoint que no es URL', () => {
    expect(esquemaSuscripcionPush.safeParse({ ...valida, endpoint: 'no-es-url' }).success).toBe(false)
  })

  it('rechaza claves vacias', () => {
    expect(esquemaSuscripcionPush.safeParse({ ...valida, p256dh: '' }).success).toBe(false)
    expect(esquemaSuscripcionPush.safeParse({ ...valida, auth: '' }).success).toBe(false)
  })

  it('nombreDispositivo es opcional pero acotado a 100', () => {
    expect(esquemaSuscripcionPush.safeParse({ ...valida, nombreDispositivo: 'PC' }).success).toBe(true)
    expect(
      esquemaSuscripcionPush.safeParse({ ...valida, nombreDispositivo: 'x'.repeat(101) }).success,
    ).toBe(false)
  })
})

describe('esquemaAnticipacion', () => {
  it('coerciona minutos desde string y respeta el rango [0, 1440]', () => {
    const r = esquemaAnticipacion.safeParse({ minutos: '15' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.minutos).toBe(15)
    expect(esquemaAnticipacion.safeParse({ minutos: -1 }).success).toBe(false)
    expect(esquemaAnticipacion.safeParse({ minutos: 1441 }).success).toBe(false)
  })
})

describe('esquemaAccionNotificacion', () => {
  const uuid = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

  it('acepta acciones validas con uuid', () => {
    expect(esquemaAccionNotificacion.safeParse({ reminderId: uuid, action: 'completar' }).success).toBe(true)
    expect(
      esquemaAccionNotificacion.safeParse({ reminderId: uuid, action: 'posponer', minutos: '10' }).success,
    ).toBe(true)
  })

  it('rechaza ids que no son uuid y acciones desconocidas', () => {
    expect(esquemaAccionNotificacion.safeParse({ reminderId: '123', action: 'completar' }).success).toBe(false)
    expect(esquemaAccionNotificacion.safeParse({ reminderId: uuid, action: 'eliminar' }).success).toBe(false)
  })

  it('minutos debe ser positivo cuando se envia', () => {
    expect(
      esquemaAccionNotificacion.safeParse({ reminderId: uuid, action: 'posponer', minutos: 0 }).success,
    ).toBe(false)
  })
})

describe('esquemaPerfil', () => {
  it('acepta un perfil valido con zona horaria de la lista', () => {
    const r = esquemaPerfil.safeParse({ nombreMostrado: 'Axel', zonaHoraria: 'America/Bogota' })
    expect(r.success).toBe(true)
  })

  it('recorta espacios del nombre', () => {
    const r = esquemaPerfil.safeParse({ nombreMostrado: '  Axel  ', zonaHoraria: 'UTC' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.nombreMostrado).toBe('Axel')
  })

  it('rechaza zonas horarias fuera de la lista', () => {
    expect(esquemaPerfil.safeParse({ zonaHoraria: 'Asia/Tokyo' }).success).toBe(false)
  })

  it('el nombre es opcional y nullable, pero no vacio ni mayor a 60', () => {
    expect(esquemaPerfil.safeParse({ zonaHoraria: 'UTC' }).success).toBe(true)
    expect(esquemaPerfil.safeParse({ nombreMostrado: null, zonaHoraria: 'UTC' }).success).toBe(true)
    expect(esquemaPerfil.safeParse({ nombreMostrado: '   ', zonaHoraria: 'UTC' }).success).toBe(false)
    expect(esquemaPerfil.safeParse({ nombreMostrado: 'x'.repeat(61), zonaHoraria: 'UTC' }).success).toBe(false)
  })
})
