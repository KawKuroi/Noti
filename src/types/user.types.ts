export interface Perfil {
  id: string
  nombreMostrado: string | null
  zonaHoraria: string
  anticipacionNotificacion: number
  resumenDiario: boolean
  horaResumen: string
  autoEliminarTareasCompletadasDias: number | null
  creadoEn: Date
  actualizadoEn: Date
}
