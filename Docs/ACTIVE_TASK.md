# Tarea activa

## Solicitud original (usuario, 2026-05-21)

> Corregir dark mode incompleto (tarjetas blancas, header/input de notas blancos) y
> mejorar la lista de cuadernos: clic en toda la tarjeta + borde visible en modo claro.

## 1. Contexto y Archivos Afectados

Problema 1 — Dark mode: varios componentes usan clases gray hardcodeadas
(bg-white, border-gray-100, text-gray-900/400/500) que no respetan el tema oscuro.
La raiz del dashboard y el sidebar ya usan tokens semanticos; hay que extender esos
tokens a los componentes de contenido.

Problema 2 — Notas: el patron absolute-inset-0/z-0 en ItemCuaderno no funciona porque
los divs hijos tienen z-10 e interceptan los clicks antes de llegar al link.
Ademas, en modo claro los items no tienen borde visible hasta el hover.

Archivos directamente involucrados (5):
- `src/components/features/reminders/tarjeta-recordatorio.tsx` — bg-white/border-gray → tokens semanticos
- `src/components/features/notas/vista-chat.tsx` — header y zona input con bg-white → tokens semanticos
- `src/components/features/notas/item-cuaderno.tsx` — clic completo + tokens semanticos + borde visible
- `src/components/features/notas/lista-cuadernos.tsx` — divide-gray-100 → divide-border
- `src/components/features/reminders/lista-recordatorios.tsx` — empty state bg-gray-100 → tokens semanticos

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** `tarjeta-recordatorio` usa `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`; `lista-recordatorios` empty states con `bg-muted` y tokens semánticos; `vista-chat` cabecera e input usan `bg-background border-border`; `lista-cuadernos` usa `divide-border`; `item-cuaderno` elimina el patrón absolute/z-0, usa `onClick` + `stopPropagation` en botones, y agrega `border border-border` visible en ambos modos.
- **Español absoluto:** sin identificadores nuevos en inglés.
- **Seguridad:** sin secretos; sin `any`.
- **TSC:** cero errores.
- **Linter:** cero warnings.
- **Sin hardcoded grays** en los 5 archivos modificados.
- **Nota UI:** `.tsx` modificados en reminders/ y notas/ — requiere validación visual en navegador.

## 2. Plan de Accion Detallado

### Bloque 1 - Dark mode en tarjetas de recordatorio y lista

- [x] **Paso 1: `src/components/features/reminders/tarjeta-recordatorio.tsx`** Reemplazar: `bg-white` → `bg-card`; `border-gray-100` (ambas instancias: completado y normal) → `border-border`; `hover:border-gray-200` → `hover:border-border/80`; `border-gray-300 hover:border-gray-500` (checkbox) → `border-border hover:border-foreground/50`; `text-gray-900` → `text-foreground`; `text-gray-400` → `text-muted-foreground`; `text-gray-500` → `text-muted-foreground`.

- [x] **Paso 2: `src/components/features/reminders/lista-recordatorios.tsx`** En los dos empty states, reemplazar: `bg-gray-100` → `bg-muted`; `text-gray-400` → `text-muted-foreground`; `text-gray-700` → `text-foreground`; `text-xs text-gray-400 mt-1` → `text-xs text-muted-foreground mt-1`. En SeccionDia: `text-gray-400` → `text-muted-foreground`.

### Bloque 2 - Dark mode en vista de notas

- [x] **Paso 3: `src/components/features/notas/vista-chat.tsx`** En la cabecera (linea ~193): reemplazar `border-b border-gray-100 bg-white` → `border-b border-border bg-background`; `text-gray-500` (boton Notas) → `text-muted-foreground`; `text-gray-900` (titulo) → `text-foreground`. En la zona de entrada (linea ~257): reemplazar `border-t border-gray-100 bg-white` → `border-t border-border bg-background`. En empty state de mensajes (linea ~233): `text-gray-400` → `text-muted-foreground`.

- [x] **Paso 4: `src/components/features/notas/lista-cuadernos.tsx`** Reemplazar `divide-gray-100` → `divide-border` en el contenedor de items.

### Bloque 3 - Clic en toda la tarjeta + borde visible en notas

- [x] **Paso 5: `src/components/features/notas/item-cuaderno.tsx`** (a) Eliminar el `<Link absolute inset-0 z-0>` y los `relative z-10` de los hijos. (b) Importar `useRouter` de next/navigation. (c) Agregar `onClick={() => router.push('/notes/' + cuaderno.id)}` en el div raiz. (d) En los botones Pencil y Trash agregar `e.stopPropagation()` antes del preventDefault existente. (e) Cambiar `hover:bg-gray-50` → `hover:bg-accent/50`; `text-gray-900` → `text-foreground`; `text-gray-400` → `text-muted-foreground`. (f) Agregar `border border-border` al div raiz para borde visible en ambos modos.
