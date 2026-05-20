# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Fase 22 (Notas multimedia) — siguiente fase de la cola.
**Estado general:** Fases 0–21 completadas. La ola priorizada original esta cerrada. Proximas fases son aditivas (ver `ROADMAP.md`).

## Fase 21 completada (sesion 2026-05-20)

- **Entrada por audio en el asistente IA** — endpoint `src/app/api/ai/transcribir/route.ts` con Groq `whisper-large-v3-turbo` y rate-limit 10 req/min; hook `src/hooks/use-audio-recorder.ts` con `MediaRecorder`, seleccion de mimeType por compatibilidad, timer, auto-stop a 60 s y manejo de permisos; boton Mic en `CommandPalette` con estados grabando (rojo + timer), procesando (loader purpura) y error inline.

## Fase 20 completada (sesion 2026-05-20)

- **Auto-eliminacion de tareas completadas** — columna `auto_delete_completed_tasks_days` en `profiles` y `completed_at` en `reminders`; migracion `0006_auto_delete_tasks.sql`; `alternarCompletado` graba la fecha de completado; cron `limpiar-tareas` diario a las 03:00 UTC elimina tareas segun config del perfil; selector en settings (Nunca / 7 / 30 / 90 dias); countdown ambar en tarjetas de tareas completadas cuando quedan 3 dias o menos.

## Fase 19 completada (sesion 2026-05-20)

- **Enlace a GitHub en landing** — boton secundario "Ver en GitHub" (icono `Github` + texto, estilo outline) agregado al bloque de CTAs del hero en `src/app/page.tsx`. Link con icono GitHub agregado al footer junto al texto del proyecto. Ambos abren `https://github.com/KawKuroi/Noti` en nueva pestana.

## Bugs resueltos (sesión 2026-05-19)

- **Bug A** — `horaVencimiento: ''` fallaba el regex en Zod aunque sea opcional. Fix: `z.preprocess` convierte `''` a `undefined` en `reminder.schemas.ts`.
- **Bug B** — Formulario manual de lanzamientos no preseleccionaba la subcategoría activa. Fix: `hub-lanzamientos.tsx` mapea `tabActiva` → `TipoLanzamiento` y lo pasa como `tipoInicial` a `FormularioManualLanzamiento`.
- **Bug C** — Editor no mostraba selector de categoría ni cargaba metadata existente. Fix: selector siempre visible, `anticipacionMin` inicializado desde el recordatorio, campos condicionales pre-llenados con metadata, `actualizarRecordatorio` ahora guarda `categoriaId`.
- **Bug D** — `confirm()` nativo al eliminar. Fix: reemplazado con `Dialog` de confirmación con botones Cancelar / Eliminar.

## Fase 18 completada (sesión 2026-05-19)

- **Utility `parsearFechaNatural`** — nuevo `src/lib/utils/parsear-fecha-natural.ts` con tabla de meses ES; resuelve `dd/mm`, `dd-mm`, `dd mmm`, `mmm dd`, `dd de mmmm`. Suma 1 año si la fecha es estrictamente anterior a hoy.
- **Extractor IA con `fechaTentativa`** — `src/lib/ai/extractor.ts` gana campo `lanzamiento.fechaTentativa: string|null` y el prompt incluye ejemplos `nov 19`, `20/06`, `3 mar`, `viernes 21` con regla anti-alucinación.
- **Pipeline con fallback determinista** — `asistente-provider.tsx` aplica `parsearFechaNatural(texto, hoy)` cuando el LLM devuelve `null` y propaga `fechaTentativa` a los candidatos sin fecha confirmada.
- **Card de extracción editable completa** — `recordatorio-form-card.tsx` ahora expone Select de anticipación (`OPCIONES_ANTICIPACION`), bloque condicional con tipo de lanzamiento + autor (libros) / artista (música) / director (películas).
- **Card de candidato pre-rellenada** — `candidato-card.tsx` abre el datepicker en modo edición con `fechaTentativa` cuando la fuente devuelve TBA o sin fecha; al confirmar persiste con `fuente='manual'`.
- **Server action con anticipación** — `crearRecordatorioDesdeIA` acepta `anticipacionMin?: number` opcional (default 15) que viaja al cálculo de `notify_at`.
- **Ruteo dual de guardado** — `confirmarRecordatorioEditado` rutea a `crearRecordatorioLanzamiento` cuando la categoría es un slug de lanzamiento (persiste metadatos JSONB), o a `crearRecordatorioDesdeIA` para recordatorios personales.

## Cambios UI (sesión 2026-05-19, ampliación post-Fase 17)

- **Saludo de inicio** — `saludo-dinamico.tsx` escalado de `text-2xl` a `text-4xl tracking-tight`; resumen pasa a `text-base mt-2` para mantener jerarquía.
- **Eliminación del FAB de asistente** — Quitado `<FabAsistente />` y su archivo. El acceso al asistente queda en Ctrl+I (CommandPalette) y en la nueva `BarraAsistente`.
- **Promoción de la barra "¿Qué te recuerdo o agendo?"** — `InputAsistenteInicio` migrado a `src/components/features/asistente/barra-asistente.tsx` como componente reutilizable. Insertado en Inicio, Lanzamientos, Pendientes, Estudio, Cumpleaños y Eventos. Calendario, Notas y Ajustes quedan sin barra (decisión explícita del usuario). Eliminado `BotonAbrirAsistente` del hub de lanzamientos por redundancia.
- **Calendario al alto completo** — `calendar/page.tsx` y `vista-calendario.tsx` ahora son `flex flex-col h-full min-h-0`; `vista-mes.tsx` usa `gridTemplateRows: repeat(filas, minmax(0, 1fr))` para que las semanas se repartan la altura disponible.
- **Vista Semana como timeline** — `vista-semana.tsx` reescrito al estilo Google Calendar: columna fija de 60px con horas 00–23 a la izquierda, 7 columnas de día, fila condicional "Todo el día" sobre el timeline (solo si existen eventos sin hora esa semana), eventos posicionados absolutamente con `top = (hora + minutos/60) * 48px`, scroll vertical interno con auto-scroll a las 07:00 al montar. Manejo de eventos solapados queda fuera de alcance.
- **Aire superior en el dashboard** — `<main>` del layout pasa de `p-6` a `px-6 pt-10 pb-6` para despegar el contenido del borde superior.

## Pendientes manuales bloqueantes

- [ ] Aplicar migracion `src/db/migrations/0006_auto_delete_tasks.sql` en el SQL Editor de Supabase (requerida para que la Fase 20 funcione en produccion)

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que los cambios de categorías de la Fase 14 se reflejen en el sidebar

## Pruebas manuales pendientes para validar la nueva ola

- [x] **Fase 14 — Recurrencia**: Crear una clase recurrente "Clase de inglés los lunes 14:00". Abrir el calendario y verificar que el dialog del día lunes muestra UNA sola entrada (no 400).
- [x] **Fase 14 — Notas**: Crear nota desde el formulario manual con título "Probar" y cuerpo "test". Confirmar que aparece en `/notes` y se puede abrir.
- [x] **Fase 14 — Fusión**: Recordatorios viejos con categoría `classes` aparecen ahora bajo `study` en el sidebar. La categoría `classes` no aparece en filtros, formulario ni asistente.
- [x] **Fase 14 — Rename**: Donde decía "Tareas" ahora dice "Pendientes" (sidebar, filtros, formulario, asistente).
- [x] **Fase 14 — Recurrentes sin checkbox**: Una clase semanal y un cumpleaños anual no muestran checkbox en su card; sí muestran botones editar/eliminar.
- [x] **Fase 15 — Sidebar**: Grupo "Herramientas" agrupa Calendario + Notas. Icono de lupa en sidebar abre Ctrl+K. Footer muestra nombre del usuario + engranaje. Cerrar sesión vive en `/settings`.
- [x] **Fase 16 — Lanzamientos**: Pestaña "Todos" en `/lanzamientos`. Cards diferenciadas por color (negro/azul/verde/rojo/morado). Formulario manual pide artista/autor/descripción/director. Las portadas se ven en el palette IA pero la card guardada no muestra portada.
- [x] **Fase 17 — Inicio**: Saludo dinámico, input IA grande, próximos recordatorios, mini-calendario lateral y chips de categorías visibles al entrar a `/inicio`.
- [ ] **Fase 18 — IA fechas**: "Lanzamiento de GTA 6 nov 19" → la card de candidatos muestra fecha 19 noviembre. La card de edición permite cambiar cualquier campo antes de confirmar. (Implementado 2026-05-19, pendiente validación visual.)
- [ ] **Fase 19 — Landing**: Botón "Ver en GitHub" en hero y link en footer abren el repo en nueva pestaña.

## Deuda técnica conocida

- La columna `sound_enabled` en `profiles` queda huérfana tras eliminar Pomodoro — housekeeping futuro
- La columna `image_url` en `reminders` queda huérfana tras la Fase 16 (decisión: portadas no persistentes) — housekeeping futuro
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminarlo en una iteración futura tras confirmar que nada lo usa.
