# Tarea activa

## Solicitud original (usuario, 2026-05-20)

> Ejecuta la Fase 19 del roadmap: landing - enlace a GitHub.

## 1. Contexto y Archivos Afectados

Un solo archivo: `src/app/page.tsx`. La landing ya tiene estructura hero + footer. La tarea agrega:
- Boton secundario "Ver en GitHub" en el hero junto a los CTAs existentes.
- Enlace GitHub en el footer junto al texto del proyecto.
- Icono `Github` de `lucide-react` (ya instalado en el proyecto).

URL del repo: `https://github.com/KawKuroi/Noti`

## 2. Plan de Accion Detallado

### Bloque 1 - Modificar landing

- [x] **Paso 1: `src/app/page.tsx`** Anadir `Github` a los imports de `lucide-react`. En el bloque de botones del hero, agregar un tercer `<a>` con icono `Github` y texto "Ver en GitHub" con estilo secundario (outline, igual que "Ya tengo cuenta") que abre en nueva pestana. En el footer, extender el parrafo izquierdo con un link de texto + icono `Github` al repo en nueva pestana.

### Bloque 2 - Verificacion

- [x] **Paso 2: Validacion estatica** Ejecutar `npx tsc --noEmit`. Cero errores.

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** boton "Ver en GitHub" agregado en hero (icono Github + texto, estilo secundario outline, `target="_blank" rel="noopener noreferrer"`). Link GitHub agregado en footer junto al texto del proyecto (icono Github + texto "GitHub", misma nueva pestana).
- **Espanol absoluto:** no hay identificadores nuevos en logica; solo JSX con texto UI en espanol y URL de GitHub. Sin ingles en codigo.
- **Seguridad:** grep de patrones sensibles devuelve solo menciones preexistentes de TMDB/RAWG en texto de UI. Sin secretos hardcodeados en codigo nuevo.
- **TSC:** salida vacia, cero errores.
- **Nota UI:** `src/app/page.tsx` modificado — requiere validacion visual en navegador.
