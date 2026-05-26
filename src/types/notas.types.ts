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

export type TipoAdjunto = 'imagen' | 'audio' | 'documento' | 'video' | 'otros'

export interface AdjuntoNota {
  id: string
  cuadernoId: string
  tipo: TipoAdjunto
  url: string
  nombreArchivo: string
  mime: string
  tamano: number
  creadoEn: string
}

export type ElementoTimeline =
  | { tipo: 'entrada'; datos: NotaEntrada }
  | { tipo: 'adjunto'; datos: AdjuntoNota }
