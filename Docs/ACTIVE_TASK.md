# Tarea activa

## Solicitud original (usuario, 2026-05-24)

> Terminar la seccion UX/Productividad de Fase 23:
> - Infinite scroll en la lista de recordatorios para usuarios con muchos items
> - Anadir una opcion para ordenar los recordatorios segun la fecha, prioridad, estado o categoria

## 1. Contexto y Archivos Afectados

La lista de recordatorios se renderiza en `ListaRecordatorios` (componente servidor-puro) que recibe todos
los registros de una vez. Las paginas de categoria (`/[slug]`) usan `getRecordatoriosPorCategoria` que
carga todos los registros sin limite ni paginacion.

Para implementar infinite scroll y ordenamiento, se necesita:
- Un tipo compartido `OrdenamientoRecordatorio` para parametrizar el orden.
- Una query paginada que soporte offset + limite + orden.
- Una Server Action que el cliente pueda llamar para cargar mas registros.
- Un componente cliente que maneje el estado de paginacion, el IntersectionObserver y el selector de orden.
- La pagina `/[slug]` actualizada para usar el nuevo componente.

Archivos directamente involucrados (5):
- `src/types/reminder.types.ts` — agrega tipo `OrdenamientoRecordatorio`
- `src/lib/queries/reminder.queries.ts` — agrega `getRecordatoriosPorCategoriaPaginados`
- `src/lib/actions/reminder.actions.ts` — agrega `cargarMasRecordatorios` server action
- `src/components/features/reminders/lista-recordatorios-paginada.tsx` — nuevo componente cliente con
  IntersectionObserver y selector de ordenamiento
- `src/app/(dashboard)/[slug]/page.tsx` — usa el nuevo componente paginado

## 2. Plan de Accion Detallado

### Bloque 1 - Tipo y query paginada

- [x] **Paso 1: `src/types/reminder.types.ts`** Agregar `export type OrdenamientoRecordatorio = 'fecha-asc' | 'fecha-desc' | 'reciente' | 'estado'`. `fecha-asc` es la mas proxima primero (default actual); `fecha-desc` es la mas lejana primero; `reciente` ordena por `creadoEn` DESC; `estado` pone pendientes antes que completados y luego por fecha.

- [x] **Paso 2: `src/lib/queries/reminder.queries.ts`** Agregar import de `OrdenamientoRecordatorio` desde types. Agregar funcion privada `obtenerOrden(ordenamiento: OrdenamientoRecordatorio)` que devuelve el array de columnas Drizzle para `orderBy`. Agregar `getRecordatoriosPorCategoriaPaginados(usuarioId, categoriaId, limite, desplazamiento, ordenamiento)` que hace SELECT con `limit(limite + 1).offset(desplazamiento)`, luego devuelve `{ recordatorios: filas.slice(0, limite).map(mapearRecordatorio), hasMas: filas.length > limite }`.

### Bloque 2 - Server Action para carga incremental

- [x] **Paso 3: `src/lib/actions/reminder.actions.ts`** Agregar import de `OrdenamientoRecordatorio` y de `getRecordatoriosPorCategoriaPaginados`. Agregar `export async function cargarMasRecordatorios(categoriaId: number, desplazamiento: number, ordenamiento: OrdenamientoRecordatorio)` que obtiene el `usuarioId` del usuario autenticado, llama a `getRecordatoriosPorCategoriaPaginados` con LIMITE=20 y devuelve `{ recordatorios, hasMas }`. Si no hay usuario, devuelve `{ recordatorios: [], hasMas: false }`.

### Bloque 3 - Componente cliente con infinite scroll y selector

- [x] **Paso 4: `src/components/features/reminders/lista-recordatorios-paginada.tsx`** Crear componente `ListaRecordatoriosPaginada` con `'use client'`. Props: `recordatoriosIniciales`, `hasMasInicial`, `categoriaId`, `categorias`, `mensajeVacio`, `diasAutoEliminar`, `destacadoId`. Estado: `registros`, `hasMas`, `ordenamiento` ('fecha-asc' default), `cargando`. Usar refs (`registrosRef`, `hasMasRef`, `cargandoRef`, `ordenamientoRef`) actualizadas en cada render para evitar closures viejas en el observer. IntersectionObserver con `rootMargin: '300px'` sobre un `div` centinela al pie de la lista; dispara `ejecutarCargaMas` que llama a `cargarMasRecordatorios(categoriaId, registrosRef.current.length, ordenamientoRef.current)` y agrega al array. Selector `<Select>` de shadcn/ui con las 4 opciones al inicio; al cambiar llama a `cambiarOrdenamiento` que llama a `cargarMasRecordatorios(categoriaId, 0, nuevoOrdenamiento)` y reemplaza el array. Indicador `<Loader2>` visible cuando `cargando`.

### Bloque 4 - Pagina de categoria actualizada

- [x] **Paso 5: `src/app/(dashboard)/[slug]/page.tsx`** Cambiar `getRecordatoriosPorCategoria` por `getRecordatoriosPorCategoriaPaginados(user.id, categoria.id, 20, 0, 'fecha-asc')`. Reemplazar `<ListaRecordatorios>` por `<ListaRecordatoriosPaginada>` pasando `recordatoriosIniciales`, `hasMasInicial`, `categoriaId={categoria.id}`, `categorias`, `mensajeVacio`, `diasAutoEliminar` y `destacadoId`. Eliminado el contador de recordatorios del header (era inexacto con paginacion).

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** query `getRecordatoriosPorCategoriaPaginados` con offset/limit/orden; server action `cargarMasRecordatorios` protegida por auth; componente `ListaRecordatoriosPaginada` con IntersectionObserver (`rootMargin: '300px'`) y selector de 4 opciones de orden; `/[slug]` usa el componente paginado con carga inicial de 20 registros.
- **Espanol absoluto:** todos los identificadores en espanol (registros, hasMas, ordenamiento, cargando, centinela, ejecutarCargaMas, cambiarOrdenamiento, desplazamiento, obtenerOrden). Metodos del ORM (`.offset()`, `.orderBy()`) son API externa.
- **Seguridad:** sin secretos; sin `any`; RLS respetado via `eq(recordatorios.usuarioId, usuarioId)`.
- **TSC:** EXIT 0, cero errores.
- **Linter:** EXIT 0, cero warnings.
- **Nota UI:** componente `.tsx` modificado en reminders/ — requiere validacion visual en navegador.
