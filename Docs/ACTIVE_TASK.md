# Tarea activa

## Solicitud original (usuario, 2026-05-21)

> Ejecuta todo el current, es decir todas las secciones de la fase 22

## 1. Contexto y Archivos Afectados

Fases 22.A + 22.B + 22.C + 22.D implementan adjuntos multimedia en los cuadernos de notas.
`note_attachments` se crea en 22.A y cada sub-fase agrega soporte para un tipo de archivo.
Los adjuntos pertenecen al cuaderno (FK cuaderno_id → reminders.id), se muestran como burbujas
en la misma timeline que los mensajes de texto, mezclados cronologicamente.

La subida se hace client-side via `@vercel/blob/client` (upload) para evitar el limite de 4.5 MB
de funciones serverless. El endpoint `/api/notas/adjunto` genera el token de carga con validaciones
de tipo y tamano. Tras el upload, el cliente llama a la action `registrarAdjunto` para escribir la
fila en BD y revalidar la ruta.

Limites por tipo: imagen 5 MB, audio 10 MB, documento 10 MB, video 25 MB.

Justificacion de exceder 5 archivos: la tarea abarca 4 sub-fases completas (22.A–22.D) con
infraestructura de BD, API, 4 visualizadores, hook de grabacion y componente de subida.

Archivos directamente involucrados (17):
- `src/db/migrations/0009_note_attachments.sql` — nueva tabla con RLS
- `src/db/schema.ts` — agregar tabla notasAdjuntos
- `src/types/notas.types.ts` — agregar AdjuntoNota y ElementoTimeline
- `src/lib/queries/adjuntos.queries.ts` — obtenerAdjuntos (nuevo)
- `src/lib/actions/adjuntos.actions.ts` — registrarAdjunto, eliminarAdjunto (nuevo)
- `src/app/api/notas/adjunto/route.ts` — handleUpload token endpoint (nuevo)
- `src/components/features/notas/visor-imagen.tsx` — lightbox para imagenes (nuevo)
- `src/components/features/notas/reproductor-audio.tsx` — player audio play/pause/seek (nuevo)
- `src/components/features/notas/visor-documento.tsx` — icono + descarga + preview PDF (nuevo)
- `src/components/features/notas/reproductor-video.tsx` — video player inline (nuevo)
- `src/components/features/notas/burbuja-adjunto.tsx` — burbuja de adjunto por tipo (nuevo)
- `src/hooks/use-grabador-audio-adjunto.ts` — graba audio y devuelve blob para adjunto (nuevo)
- `src/components/features/notas/subir-adjunto.tsx` — boton clip + drag&drop + boton mic (nuevo)
- `src/components/features/notas/vista-chat.tsx` — merge timeline entradas+adjuntos, boton subir
- `src/app/(dashboard)/notes/[id]/page.tsx` — fetch adjuntos + pasar al componente
- `.env.example` — agregar BLOB_READ_WRITE_TOKEN [HECHO]
- `package.json` — dependencia @vercel/blob [HECHO]

## 2. Plan de Accion Detallado

### Bloque 1 - Base de datos

- [ ] **Paso 1: `src/db/migrations/0009_note_attachments.sql`** CREATE TABLE note_attachments con columnas id UUID PK, cuaderno_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE, tipo TEXT NOT NULL CHECK (tipo IN ('imagen','audio','documento','video')), url TEXT NOT NULL, nombre_archivo TEXT NOT NULL, mime TEXT NOT NULL, tamano INTEGER NOT NULL, creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(). CREATE INDEX idx_note_attachments_cuaderno ON note_attachments(cuaderno_id). ALTER TABLE ENABLE ROW LEVEL SECURITY. CREATE POLICY para que el usuario solo vea sus adjuntos via cuaderno_id IN (SELECT id FROM reminders WHERE user_id = auth.uid()).

- [ ] **Paso 2: `src/db/schema.ts`** Agregar exportacion `notasAdjuntos` con campos id, cuadernoId (FK→recordatorios.id CASCADE), tipo ($type<'imagen'|'audio'|'documento'|'video'>), url, nombreArchivo, mime, tamano (integer), creadoEn. Agregar index idxAdjuntosCuaderno.

### Bloque 2 - Tipos, queries y acciones

- [ ] **Paso 3: `src/types/notas.types.ts`** Agregar interfaz AdjuntoNota { id, cuadernoId, tipo ('imagen'|'audio'|'documento'|'video'), url, nombreArchivo, mime, tamano, creadoEn }. Agregar tipo ElementoTimeline = { tipo: 'entrada'; datos: NotaEntrada } | { tipo: 'adjunto'; datos: AdjuntoNota }.

- [ ] **Paso 4: `src/lib/queries/adjuntos.queries.ts`** Crear archivo nuevo. Funcion `obtenerAdjuntos(cuadernoId: string, usuarioId: string): Promise<AdjuntoNota[]>`: verificar propiedad del cuaderno (SELECT recordatorios WHERE id AND usuarioId), luego SELECT notasAdjuntos WHERE cuadernoId ORDER BY creadoEn ASC.

- [ ] **Paso 5: `src/lib/actions/adjuntos.actions.ts`** Crear archivo nuevo con 'use server'. (a) `registrarAdjunto(cuadernoId, tipo, url, nombreArchivo, mime, tamano)`: verificar auth, verificar propiedad del cuaderno, validar que url empiece con 'https://' y termine en dominio de blob de vercel (incluir patron *.vercel-storage.com y *.public.blob.vercel-storage.com), INSERT notasAdjuntos, UPDATE recordatorios.actualizadoEn, revalidatePath('/notes' y `/notes/${cuadernoId}`), retornar { ok, adjunto? }. (b) `eliminarAdjunto(id)`: verificar auth, buscar adjunto via JOIN con recordatorios para verificar propiedad, guardar la url, DELETE de notasAdjuntos, llamar `del(url)` de @vercel/blob para borrar del storage, revalidatePath, retornar { ok }.

### Bloque 3 - API route

- [ ] **Paso 6: `src/app/api/notas/adjunto/route.ts`** Crear route handler. POST handler con `handleUpload` de @vercel/blob/client. En `onBeforeGenerateToken(pathname, clientPayload)`: obtener user con createClient de supabase/server; parsear clientPayload como { cuadernoId, tipo, nombreArchivo, tamano }; validar que tipo sea uno de los 4 validos; definir limites { imagen: 5MB, audio: 10MB, documento: 10MB, video: 25MB }; validar tamano contra limite; validar propiedad del cuaderno via Drizzle (SELECT recordatorios WHERE id=cuadernoId AND usuarioId); retornar { allowedContentTypes (segun tipo), maximumSizeInBytes, tokenPayload: JSON.stringify({...datos, usuarioId}) }. El onUploadCompleted solo llama revalidatePath (la insercion en BD la hace el cliente via registrarAdjunto). Retornar NextResponse.json(jsonResponse). En caso de error retornar NextResponse.json({ error }, { status: 400 }).

### Bloque 4 - Componentes de visualizacion

- [ ] **Paso 7: `src/components/features/notas/visor-imagen.tsx`** Componente cliente `VisorImagen({ src, nombreArchivo, onEliminar? })`. Imagen thumbnail 200px clickeable que abre Dialog lightbox con imagen a tamano completo (max-w-3xl), boton cerrar y boton opcional de eliminar. Usar `<img>` nativo (no next/image) para evitar configuracion de dominios.

- [ ] **Paso 8: `src/components/features/notas/reproductor-audio.tsx`** Componente cliente `ReproductorAudio({ src, nombreArchivo, onEliminar? })`. Usa un `<audio>` ref invisible. Estado: reproduciendo, progreso (currentTime), duracion. Controles: boton play/pause (icono Play/Pause), barra de progreso tipo `<input type="range">` que actualiza currentTime via ref.current.currentTime. Muestra nombre del archivo y tiempo formato mm:ss. Boton opcional de eliminar. Llama `loadedmetadata` para obtener duracion.

- [ ] **Paso 9: `src/components/features/notas/visor-documento.tsx`** Componente cliente `VisorDocumento({ src, nombreArchivo, mime, onEliminar? })`. Muestra icono por tipo: FileText (PDF), FileType (DOCX), File (TXT). Nombre de archivo truncado. Boton de descarga (<a href={src} download={nombreArchivo}>). Para PDF: boton "Ver" que abre Dialog con <embed src={src} type="application/pdf"> a full height. Boton opcional de eliminar.

- [ ] **Paso 10: `src/components/features/notas/reproductor-video.tsx`** Componente cliente `ReproductorVideo({ src, nombreArchivo, onEliminar? })`. `<video controls src={src}>` con className max-w-full rounded-lg. Boton opcional de eliminar debajo. Tamano maximo en el chat: max-w-xs.

- [ ] **Paso 11: `src/components/features/notas/burbuja-adjunto.tsx`** Componente cliente `BurbujaAdjunto({ adjunto: AdjuntoNota, onEliminar })`. Burbuja alineada a la derecha (igual que BurbujaEntrada). Renderiza el componente correspondiente segun `adjunto.tipo`: 'imagen' → VisorImagen, 'audio' → ReproductorAudio, 'documento' → VisorDocumento, 'video' → ReproductorVideo. Pasa `onEliminar` al subcomponente. Muestra la hora relativa debajo de la burbuja igual que BurbujaEntrada.

### Bloque 5 - Hook de grabacion y componente de subida

- [ ] **Paso 12: `src/hooks/use-grabador-audio-adjunto.ts`** Hook cliente `useGrabadorAudioAdjunto(onBlobListo: (blob: Blob, mimeType: string) => void)`. Reutiliza la logica de MediaRecorder de useAudioRecorder pero sin la llamada a Whisper. Estado: grabando (bool), segundosGrabando, error. Al detenerse, construye el Blob y llama onBlobListo(blob, mimeType). Auto-detiene a 60 s. Retorna { grabando, segundosGrabando, error, iniciarGrabacion, detenerGrabacion }.

- [ ] **Paso 13: `src/components/features/notas/subir-adjunto.tsx`** Componente cliente `SubirAdjunto({ cuadernoId, onAdjuntoSubido })`. Estado: subiendo (bool), errorSubida. Renderiza dos controles: (a) input type="file" oculto + Button con Paperclip que lo activa (acepta imagenes, audios, documentos, videos segun mimeTypes permitidos); (b) Button con Mic que usa useGrabadorAudioAdjunto. Funcion `subirArchivo(archivo: File, tipo: TipoAdjunto)`: validar tamano segun tipo (5/10/10/25 MB), llamar `upload(nombreUnico, archivo, { access: 'public', handleUploadUrl: '/api/notas/adjunto', clientPayload: JSON.stringify({cuadernoId, tipo, nombreArchivo: archivo.name, tamano: archivo.size}) })` de @vercel/blob/client, luego llamar `registrarAdjunto(...)` con el url devuelto, llamar onAdjuntoSubido con el AdjuntoNota resultante. Mostrar Loader mientras sube. Toast de error si falla.

### Bloque 6 - Integracion en chat

- [ ] **Paso 14: `src/app/(dashboard)/notes/[id]/page.tsx`** Agregar importacion de `obtenerAdjuntos`. En el Promise.all, incluir `obtenerAdjuntos(id, user.id)`. Pasar `adjuntosIniciales={adjuntos}` a VistaChatNotas.

- [ ] **Paso 15: `src/components/features/notas/vista-chat.tsx`** (a) Agregar prop `adjuntosIniciales: AdjuntoNota[]`. (b) Estado `adjuntos` iniciado desde prop. (c) Funcion `manejarAdjuntoSubido(adj: AdjuntoNota)` que agrega al estado. (d) Funcion `manejarEliminarAdjunto(id)` que llama `eliminarAdjunto` y filtra estado. (e) Construir `elementosTimeline: ElementoTimeline[]` = mezcla de entradas y adjuntos ordenados por creadoEn ASC. (f) Zona de mensajes renderiza elementosTimeline: cada 'entrada' → BurbujaEntrada, cada 'adjunto' → BurbujaAdjunto con onEliminar=manejarEliminarAdjunto. (g) En zona de entrada, agregar `<SubirAdjunto cuadernoId={cuaderno.id} onAdjuntoSubido={manejarAdjuntoSubido} />` al lado del Textarea+boton enviar.

