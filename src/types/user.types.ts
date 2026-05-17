export interface Perfil {
  id: string
  nombreMostrado: string | null
  zonaHoraria: string
  anticipacionNotificacion: number
  sonidoHabilitado: boolean
  resumenDiario: boolean
  horaResumen: string
  creadoEn: Date
  actualizadoEn: Date
}
