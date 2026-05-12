export interface Perfil {
  id: string
  nombreMostrado: string | null
  zonaHoraria: string
  anticipacionNotificacion: number
  creadoEn: Date
  actualizadoEn: Date
}
