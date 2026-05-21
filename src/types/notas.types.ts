export interface NotaEntrada {
  id: string
  cuadernoId: string
  contenido: string
  creadoEn: string
  actualizadoEn: string
}

export interface CuadernoConPrevia {
  id: string
  titulo: string
  creadoEn: string
  actualizadoEn: string
  ultimaEntrada: NotaEntrada | null
  totalEntradas: number
}
