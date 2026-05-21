# Tarea activa

## Solicitud original (usuario, 2026-05-21)

> Ejecuta el current — Fase 22.0: Reestructuración de notas (estilo WhatsApp)

## 1. Contexto y Archivos Afectados

Fase 22.0 convierte el sistema de notas en cuadernos tipo chat de WhatsApp.
Cada cuaderno (notebook) = `reminders` con `category=notes` (titulo=nombre, renombrable/eliminable).
Dentro de cada cuaderno: entradas de texto (mensajes) en nueva tabla `note_entries`.
La descripcion existente se migra como primera entrada en la migracion SQL.

Archivos directamente involucrados:
- `src/db/migrations/0008_note_entries.sql` — nueva tabla note_entries con RLS y migracion de descripciones
- `src/db/schema.ts` — agregar tabla `notasEntradas`
- `src/types/notas.types.ts` — tipos `NotaEntrada` y `CuadernoConPrevia` (nuevo archivo)
- `src/lib/queries/notas.queries.ts` — queries dedicadas: `obtenerCuadernos`, `obtenerEntradas` (nuevo archivo)
- `src/lib/actions/notas.actions.ts` — acciones: `crearCuaderno`, `renombrarCuaderno`, `eliminarCuaderno`, `crearEntrada`, `actualizarEntrada`, `eliminarEntrada` (nuevo archivo)
- `src/components/features/notas/item-cuaderno.tsx` — fila de cuaderno en la lista estilo WhatsApp (nuevo)
- `src/components/features/notas/lista-cuadernos.tsx` — lista completa de cuadernos con empty state (nuevo)
- `src/components/features/notas/burbuja-entrada.tsx` — burbuja de mensaje con edicion y eliminacion inline (nuevo)
- `src/components/features/notas/vista-chat.tsx` — vista de chat completa: scroll, input fijo, auto-scroll (nuevo)
- `src/components/features/notas/modal-nuevo-cuaderno.tsx` — dialog para crear cuaderno con solo nombre (nuevo)
- `src/app/(dashboard)/notes/page.tsx` — reescribir: encabezado + lista de cuadernos
- `src/app/(dashboard)/notes/[id]/page.tsx` — reescribir: cargar cuaderno + entradas, renderizar vista-chat

## 2. Plan de Accion Detallado

### Bloque 1 - Base de datos

- [x] **Paso 1: `src/db/migrations/0008_note_entries.sql`** Crear la migracion. (a) CREATE TABLE `note_entries` con columnas `id UUID PK`, `cuaderno_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE`, `content TEXT NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`. (b) CREATE INDEX `idx_note_entries_cuaderno` en `cuaderno_id`. (c) ALTER TABLE ENABLE ROW LEVEL SECURITY. (d) CREATE POLICY "usuarios ven sus entradas" FOR ALL USING/WITH CHECK que `cuaderno_id IN (SELECT id FROM reminders WHERE user_id = auth.uid())`. (e) INSERT INTO note_entries migrando `description` de reminders existentes con category notes (solo si description IS NOT NULL y != '').

- [x] **Paso 2: `src/db/schema.ts`** Agregar tabla `notasEntradas` con campos: `id uuid PK`, `cuadernoId uuid FK->recordatorios.id CASCADE`, `contenido text('content')`, `creadoEn timestamp('created_at')`, `actualizadoEn timestamp('updated_at')`. Agregar index `idx_note_entries_cuaderno` en `cuadernoId`.

### Bloque 2 - Tipos, queries y acciones

- [x] **Paso 3: `src/types/notas.types.ts`** Crear el archivo. Exportar `interface NotaEntrada { id: string; cuadernoId: string; contenido: string; creadoEn: string; actualizadoEn: string }` y `interface CuadernoConPrevia { id: string; titulo: string; creadoEn: string; actualizadoEn: string; ultimaEntrada: NotaEntrada | null; totalEntradas: number }`.

- [x] **Paso 4: `src/lib/queries/notas.queries.ts`** Crear el archivo. Funcion `obtenerCuadernos(usuarioId: string): Promise<CuadernoConPrevia[]>`: (a) query reminders JOIN categorias WHERE slug='notes' AND usuarioId, ORDER BY actualizadoEn DESC; (b) query notasEntradas WHERE cuadernoId IN (...ids); (c) agrupar en JS por cuadernoId para obtener ultimaEntrada (primera ordenada por creadoEn DESC) y totalEntradas; (d) retornar array CuadernoConPrevia. Funcion `obtenerEntradas(cuadernoId: string, usuarioId: string): Promise<NotaEntrada[]>`: verificar propiedad del cuaderno (query reminders WHERE id AND usuarioId), luego query notasEntradas WHERE cuadernoId ORDER BY creadoEn ASC.

- [x] **Paso 5: `src/lib/actions/notas.actions.ts`** Crear el archivo con 'use server'. Implementar: (a) `crearCuaderno(nombre: string)` — obtener usuario, obtener categorias para 'notes', INSERT en recordatorios con titulo=nombre, revalidatePath('/notes'), retornar `{ ok, id? }`; (b) `renombrarCuaderno(id: string, nombre: string)` — verificar auth, UPDATE recordatorios WHERE id AND usuarioId, revalidatePath('/notes') + revalidatePath(`/notes/${id}`); (c) `eliminarCuaderno(id: string)` — verificar auth, DELETE recordatorios WHERE id AND usuarioId (CASCADE elimina entradas), revalidatePath('/notes'); (d) `crearEntrada(cuadernoId: string, contenido: string)` — verificar auth, verificar propiedad del cuaderno, INSERT en notasEntradas, UPDATE recordatorios.actualizadoEn=NOW(), revalidatePath(`/notes/${cuadernoId}`) + revalidatePath('/notes'), retornar `{ ok, entrada? }`; (e) `actualizarEntrada(id: string, contenido: string)` — auth, buscar entrada para obtener cuadernoId y verificar propiedad, UPDATE notasEntradas, revalidatePath correspondiente; (f) `eliminarEntrada(id: string)` — auth, buscar entrada (obtener cuadernoId), verificar propiedad, DELETE, revalidatePath.

### Bloque 3 - Componentes

- [x] **Paso 6: `src/components/features/notas/item-cuaderno.tsx`** Componente cliente `ItemCuaderno({ cuaderno: CuadernoConPrevia, onRenombrar, onEliminar })`. Layout fila: (a) circulo de avatar 40px con inicial del titulo, color indigo; (b) columna central: titulo en negrita + preview de ultimaEntrada.contenido truncado o "Sin mensajes" en gris italica; (c) columna derecha: hora relativa con `formatDistanceToNow(new Date(cuaderno.actualizadoEn), { locale: es, addSuffix: true })`; (d) en hover mostrar boton lapiz (llama onRenombrar) y boton papelera (llama onEliminar con Dialog de confirmacion); todo el row es clickable (Link a `/notes/${cuaderno.id}`).

- [x] **Paso 7: `src/components/features/notas/lista-cuadernos.tsx`** Componente cliente `ListaCuadernos({ cuadernos: CuadernoConPrevia[] })`. Estado: `lista` iniciada desde props, funcion `manejarRenombrar(id, nombre)` que llama `renombrarCuaderno` y actualiza estado local, funcion `manejarEliminar(id)` que llama `eliminarCuaderno` y filtra el estado local. Dialogo de renombrar: estado `renombrando: { id, titulo } | null`, Input con defaultValue, boton Guardar. Si `lista.length === 0`, mostrar EmptyState con mensaje "Crea tu primer cuaderno". Renderizar `lista.map((c) => <ItemCuaderno>)`.

- [x] **Paso 8: `src/components/features/notas/burbuja-entrada.tsx`** Componente cliente `BurbujaEntrada({ entrada: NotaEntrada, onActualizar, onEliminar })`. Estado: `editando: boolean`, `textoEdit: string`. Vista normal: div alineado a la derecha, burbuja indigo con texto blanco, hora en gris fuera de la burbuja, en hover aparecen iconos editar/eliminar a la IZQUIERDA de la burbuja. Vista edicion: textarea con el texto actual, boton Guardar (llama onActualizar con el texto nuevo y setea editando=false) y boton Cancelar.

- [x] **Paso 9: `src/components/features/notas/vista-chat.tsx`** Componente cliente `VistaChatNotas({ cuaderno: CuadernoConPrevia, entradasIniciales: NotaEntrada[] })`. Estado: `entradas` iniciadas desde `entradasIniciales`, `textoNuevo: string`, `enviando: boolean`. Ref `finRef` para auto-scroll. `useEffect` que hace scroll al final al montar y cada vez que `entradas` cambia. Funciones: `manejarEnviar` (valida no vacio, llama crearEntrada, agrega al estado local o recarga); `manejarActualizar(id, contenido)` (llama actualizarEntrada, actualiza estado); `manejarEliminar(id)` (llama eliminarEntrada, filtra estado). Layout: `flex flex-col h-full`; header fijo con boton `<- Notas`, titulo del cuaderno, botones renombrar y eliminar cuaderno; zona de mensajes `flex-1 overflow-y-auto p-4 space-y-3`; zona de entrada fija en el fondo: `<Textarea>` para `textoNuevo` que acepta Enter (sin shift) para enviar, boton `<- Enviar`.

- [x] **Paso 10: `src/components/features/notas/modal-nuevo-cuaderno.tsx`** Componente cliente `ModalNuevoCuaderno({ abierto, onCerrar })`. Dialog con Input para el nombre del cuaderno, validacion minima (no vacio), llama `crearCuaderno(nombre)` en submit, navega a `/notes/${nuevoId}` tras exito. Boton Cancelar cierra sin crear.

### Bloque 4 - Paginas

- [x] **Paso 11: `src/app/(dashboard)/notes/page.tsx`** Reescribir completamente. Importar `obtenerCuadernos`, `requerirUsuario`. En el Server Component: obtener usuario, llamar `obtenerCuadernos`. Layout: div max-w-2xl mx-auto; header con icono StickyNote + titulo "Notas" + contador + boton estado `abierto` que controla `ModalNuevoCuaderno`; `<ListaCuadernos cuadernos={cuadernos} />`.

- [x] **Paso 12: `src/app/(dashboard)/notes/[id]/page.tsx`** Reescribir completamente. Importar `obtenerEntradas`, `getRecordatorioPorId`, `requerirUsuario`. Server Component: obtener usuario, obtener cuaderno (getRecordatorioPorId, notFound si null o si categoriaId != notes), obtener entradas (obtenerEntradas). Construir `cuadernoConPrevia` a partir de los datos. Renderizar `<VistaChatNotas cuaderno={cuadernoConPrevia} entradasIniciales={entradas} />`.

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** tabla `note_entries` con RLS + migracion de descripciones existentes; schema Drizzle `notasEntradas`; tipos `NotaEntrada` / `CuadernoConPrevia`; queries `obtenerCuadernos` (2 queries + agrupacion JS) y `obtenerEntradas` (verificacion de propiedad); 6 acciones server con auth y revalidacion; lista de cuadernos estilo WhatsApp con renombrar/eliminar inline; vista de chat con burbujas alineadas a la derecha, edicion inline, enviar con Enter, auto-scroll al fondo; modal de nuevo cuaderno; paginas Server Component con data fetching correcto.
- **Espanol absoluto:** identificadores: `crearCuaderno`, `renombrarCuaderno`, `eliminarCuaderno`, `crearEntrada`, `actualizarEntrada`, `eliminarEntrada`, `obtenerCuadernos`, `obtenerEntradas`, `mapearEntrada`, `notasEntradas`, `cuadernoId`, `contenido`, `ultimaEntrada`, `totalEntradas`, `BurbujaEntrada`, `VistaChatNotas`, `ListaCuadernos`, `ItemCuaderno`, `ModalNuevoCuaderno`, `BotonNuevoCuaderno`.
- **Seguridad:** todas las acciones verifican `obtenerUsuarioId()`; queries verifican propiedad del cuaderno via JOIN; sin credenciales hardcodeadas; RLS en la migracion SQL.
- **TSC:** cero errores.
- **Linter:** cero warnings.
- **Nota UI:** archivos `.tsx` modificados bajo `src/components/features/notas/` y `src/app/(dashboard)/notes/` — requiere validacion visual en navegador.
