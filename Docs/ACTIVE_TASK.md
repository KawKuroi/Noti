# Tarea activa

## Solicitud original (usuario, 2026-05-20)

> Ejecuta el current — Fase 21: Entrada por audio en el asistente IA

## 1. Contexto y Archivos Afectados

Fase 21 introduce grabación de voz en el asistente. El flujo: usuario pulsa mic en el CommandPalette → MediaRecorder captura audio → POST /api/ai/transcribir → Groq Whisper devuelve texto → texto aparece en el input para revisión → usuario envía normalmente.

Archivos directamente involucrados:
- `src/app/api/ai/transcribir/route.ts` — nuevo endpoint POST: recibe FormData con audio, valida, llama Groq Whisper `whisper-large-v3-turbo`, rate-limit 10 req/min, devuelve `{ texto: string }`
- `src/hooks/use-audio-recorder.ts` — nuevo hook cliente: encapsula `MediaRecorder`, gestiona permisos, timer de grabación (máx 60s), envío al endpoint y callback `onTranscripcion(texto)`
- `src/components/features/asistente/command-palette.tsx` — modificar header: agregar botón Mic junto al input, mostrar timer rojo al grabar, loader al procesar, mensaje de error de permiso inline

## 2. Plan de Accion Detallado

### Bloque 1 - Endpoint de transcripcion

- [x] **Paso 1: `src/app/api/ai/transcribir/route.ts`** Crear el archivo. Handler POST: (a) auth con `obtenerUsuario`, (b) rate-limit `verificarLimite` 10 req/min, (c) verificar `GROQ_API_KEY`, (d) parsear FormData y extraer `audio` como Blob, (e) validar que el audio existe y pesa menos de 25 MB, (f) reenviar FormData a `https://api.groq.com/openai/v1/audio/transcriptions` con headers `Authorization: Bearer $GROQ_API_KEY` y campos `model=whisper-large-v3-turbo`, `language=es`, `response_format=json`, (g) leer `{ text }` de la respuesta de Groq y devolver `Response.json({ texto: text })`.

### Bloque 2 - Hook de grabacion

- [x] **Paso 2: `src/hooks/use-audio-recorder.ts`** Crear el hook. Estado: `EstadoGrabacion = 'inactivo' | 'grabando' | 'procesando' | 'error'`, `segundosGrabando: number`, `errorGrabacion: string | null`. Refs: `grabadorRef<MediaRecorder>`, `chunkRef<Blob[]>`, `intervaloRef`, `timeoutRef`. Función `iniciarGrabacion`: pedir permiso de micrófono con `getUserMedia`, crear `MediaRecorder` (mimeType elegido por compatibilidad: `audio/webm;codecs=opus` → `audio/webm` → `audio/ogg` en ese orden), acumular chunks en `ondataavailable`, en `onstop` construir Blob, hacer POST a `/api/ai/transcribir`, llamar `onTranscripcion(texto)` y volver a `inactivo`. Función `detenerGrabacion`: llama `grabador.stop()` y limpia el intervalo. Auto-stop a los 60 segundos. Manejo de errores de permiso (`NotAllowedError`) y de transcripción.

### Bloque 3 - UI en CommandPalette

- [x] **Paso 3: `src/components/features/asistente/command-palette.tsx`** Modificar el archivo. (a) Agregar `Mic`, `Square` a las importaciones de lucide-react. (b) Importar `useAudioRecorder` de `@/hooks/use-audio-recorder`. (c) En el cuerpo del componente, definir `alTranscribir` con `useCallback` que llame `setQuery(texto)`. (d) Instanciar `useAudioRecorder(alTranscribir)` para obtener `estadoGrabacion`, `segundosGrabando`, `errorGrabacion`, `iniciarGrabacion`, `detenerGrabacion`. (e) En el JSX del header, insertar el bloque del micrófono entre el spinner de carga y el botón Buscar: cuando `estadoGrabacion === 'grabando'` mostrar botón rojo con `Square` + timer `"{segundosGrabando}s"`; cuando `'procesando'` mostrar `Loader2` con clase `text-purple-500`; cuando `'inactivo'` o `'error'` mostrar botón con `Mic` y title "Dictado por voz". (f) Debajo del header agregar un `<div>` condicional que muestre `errorGrabacion` si existe como texto rojo pequeño dentro del panel.

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** endpoint `/api/ai/transcribir` creado con `whisper-large-v3-turbo`, rate-limit 10 req/min, validacion de tamano (25 MB); hook `useAudioRecorder` encapsula `MediaRecorder` con seleccion de mimeType por compatibilidad, timer de grabacion, auto-stop a 60s y manejo de errores de permiso; boton Mic integrado en `CommandPalette` con estados visuales: icono + timer rojo al grabar, loader purpura al procesar, icono inactivo; error de microfono visible bajo el header.
- **Espanol absoluto:** identificadores nuevos en espanol: `estadoGrabacion`, `segundosGrabando`, `errorGrabacion`, `iniciarGrabacion`, `detenerGrabacion`, `alTranscribir`, `chunkRef`, `grabadorRef`, `timeoutRef`, `intervaloRef`, `limpiarTimers`, `elegirMimeType`, `formularioGroq`, `micDeshabilitado`.
- **Seguridad:** `GROQ_API_KEY` solo accedida via `process.env`; sin credenciales hardcodeadas; rate-limit por usuario.
- **TSC:** cero errores.
- **Linter:** cero warnings.
- **Nota UI:** `command-palette.tsx` modificado — requiere validacion visual en navegador.
