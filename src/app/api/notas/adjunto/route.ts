import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios } from '@/db/schema'
import { crearClienteServidor } from '@/lib/supabase/server'
import type { TipoAdjunto } from '@/types/notas.types'

const MIMES_POR_TIPO: Record<Exclude<TipoAdjunto, 'otros'>, string[]> = {
  imagen: ['image/jpeg', 'image/png', 'image/webp'],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
  documento: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  video: ['video/mp4', 'video/webm'],
}

const LIMITE_MB_POR_TIPO: Record<TipoAdjunto, number> = {
  imagen: 5,
  audio: 10,
  documento: 10,
  video: 25,
  otros: 10,
}

const TIPOS_VALIDOS: TipoAdjunto[] = ['imagen', 'audio', 'documento', 'video', 'otros']

interface DatosClientePayload {
  cuadernoId: string
  tipo: TipoAdjunto
  nombreArchivo: string
  tamano: number
}

export async function POST(request: Request): Promise<NextResponse> {
  const cuerpo = (await request.json()) as HandleUploadBody

  try {
    const respuesta = await handleUpload({
      body: cuerpo,
      request,
      onBeforeGenerateToken: async (
        _pathname: string,
        clientPayload: string | null | undefined,
      ) => {
        const supabase = await crearClienteServidor()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')

        const datos = JSON.parse(clientPayload ?? '{}') as DatosClientePayload

        if (!TIPOS_VALIDOS.includes(datos.tipo)) throw new Error('Tipo de archivo no permitido')

        const limiteMb = LIMITE_MB_POR_TIPO[datos.tipo]
        if (datos.tamano > limiteMb * 1024 * 1024) {
          throw new Error(`El archivo supera el limite de ${limiteMb} MB para ${datos.tipo}`)
        }

        const filaCuaderno = await db
          .select({ id: recordatorios.id })
          .from(recordatorios)
          .where(and(eq(recordatorios.id, datos.cuadernoId), eq(recordatorios.usuarioId, user.id)))
          .limit(1)

        if (!filaCuaderno[0]) throw new Error('Cuaderno no encontrado')

        // Para 'otros' no restringimos por mime (cualquier tipo permitido).
        const allowedContentTypes =
          datos.tipo === 'otros' ? undefined : MIMES_POR_TIPO[datos.tipo]

        return {
          allowedContentTypes,
          maximumSizeInBytes: limiteMb * 1024 * 1024,
          tokenPayload: JSON.stringify({
            ...datos,
            usuarioId: user.id,
          }),
        }
      },
      onUploadCompleted: async () => {
        // La insercion en BD la realiza el cliente via registrarAdjunto() tras recibir la URL
      },
    })

    return NextResponse.json(respuesta)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar la subida' },
      { status: 400 },
    )
  }
}
