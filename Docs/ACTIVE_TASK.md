### 1. Contexto y Archivos Afectados

**Tarea:** Countdown de cumpleanos — notificacion push "Faltan N dias para el cumpleanos de [nombre]" enviada 3 dias y 1 dia antes del cumpleanos. Feature del Roadmap Fase 23, seccion "Notificaciones y segundo plano".

| Archivo | Rol |
|---|---|
| `src/lib/queries/reminder.queries.ts` | Agregar `getCumpleanosEnDias(diasAnticipacion)` que consulta cumpleanos cuya `fechaVencimiento` cae exactamente en N dias UTC, uniendo con la tabla `categorias` para filtrar por `slug='birthdays'` |
| `src/lib/services/push.service.ts` | Agregar `procesarCountdownCumpleanos()` que itera dias=[3,1], llama a la query e invoca `enviarPushAUsuario` con texto de countdown adecuado para cada caso |
| `src/app/api/cron/check-reminders/route.ts` | Agregar import de `procesarCountdownCumpleanos` y ejecutarla en paralelo con `procesarRecordatoriosPendientes()` via `Promise.all` |

### 2. Plan de Accion Detallado

- [x] **Paso 1: [src/lib/queries/reminder.queries.ts]** Agregar al final del archivo la funcion exportada `getCumpleanosEnDias(diasAnticipacion: number): Promise<{ id: string; usuarioId: string; titulo: string }[]>`. Logica: calcular fecha objetivo = hoy UTC + N dias (inicio de dia 00:00:00 y fin de dia 23:59:59 en UTC). Hacer SELECT con join a `categorias` filtrando `eq(categorias.slug, 'birthdays')`, `eq(recordatorios.estaCompletado, false)`, `isNotNull(recordatorios.fechaVencimiento)`, `gte(recordatorios.fechaVencimiento, inicioObjetivo)`, `lte(recordatorios.fechaVencimiento, finObjetivo)`.

- [x] **Paso 2: [src/lib/services/push.service.ts]** Agregar `getCumpleanosEnDias` al import de `@/lib/queries/reminder.queries`. Agregar al final del archivo la funcion exportada `procesarCountdownCumpleanos(): Promise<{ enviados: number }>`. Itera sobre `[3, 1]`. Para cada valor de dias: llama a `getCumpleanosEnDias(dias)`, y por cada resultado construye un `PayloadPush` con `title = dias === 1 ? 'Manana es el cumpleanos' : 'Faltan ${dias} dias para el cumpleanos'` y `body = c.titulo`, luego llama a `enviarPushAUsuario`. Retorna el total de enviados.

- [x] **Paso 3: [src/app/api/cron/check-reminders/route.ts]** Agregar `procesarCountdownCumpleanos` al import desde push.service. Reemplazar el try body para usar `const [{ procesados }, { enviados: cumpleanosEnviados }] = await Promise.all([procesarRecordatoriosPendientes(), procesarCountdownCumpleanos()])`. Actualizar el JSON de respuesta para incluir `cumpleanosEnviados`.

### 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** `getCumpleanosEnDias` consulta cumpleanos cuya `fechaVencimiento` cae en el rango UTC de N dias. `procesarCountdownCumpleanos` itera `[3, 1]` y envia push con titulo contextual. El cron ejecuta ambas funciones en paralelo con `Promise.all`.
- **Espanol absoluto:** `diasAnticipacion`, `inicioObjetivo`, `finObjetivo`, `cumpleanos`, `enviados`, `cumpleanosEnviados` — todos en espanol. Sin ingles en logica nueva.
- **Seguridad:** sin secretos hardcodeados, sin `any`, RLS respetado via filtro de `usuarioId` en `enviarPushAUsuario`.
- **TSC:** exit 0, cero errores.
- **Linter:** exit 0, cero warnings.
- **Sin cambios de UI:** no se modificaron archivos `.tsx` ni `.css`. Validacion visual no requerida.
