export interface Perfil {
  id: string
  nombreMostrado: string | null
  zonaHoraria: string
  anticipacionNotificacion: number
  resumenDiario: boolean
  horaResumen: string
  creadoEn: Date
  actualizadoEn: Date
}
