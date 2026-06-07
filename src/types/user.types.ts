export interface Perfil {
  id: string
  nombreMostrado: string | null
  zonaHoraria: string
  anticipacionNotificacion: number
  resumenDiario: boolean
  horaResumen: string
  autoEliminarTareasCompletadasDias: number | null
  autoEliminarVencidosDias: number | null
  eliminadoEn: Date | null
  creadoEn: Date
  actualizadoEn: Date
}
