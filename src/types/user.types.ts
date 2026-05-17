export interface Perfil {
  id: string
  nombreMostrado: string | null
  zonaHoraria: string
  anticipacionNotificacion: number
  sonidoHabilitado: boolean
  creadoEn: Date
  actualizadoEn: Date
}
