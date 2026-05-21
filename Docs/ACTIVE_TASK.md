# Tarea activa

## Solicitud original (usuario, 2026-05-21)

> Ve en orden parte por parte (Fase 23 — primer item: Dark mode)

## 1. Contexto y Archivos Afectados

Dark mode via `next-themes` + variables CSS semánticas de shadcn/ui.
`tailwind.config.ts` ya tiene `darkMode: ['class']`.
`globals.css` tiene variables `:root` pero sin bloque `.dark`.
El shell (sidebar + layout dashboard) usa clases gray hardcodeadas que se migran
a tokens semánticos (bg-background, text-foreground, border-border, etc.) para que
el toggle de tema las invierta automáticamente.
El toggle (Sol/Luna) se ubica en el footer del sidebar junto al engranaje.

Archivos directamente involucrados (5 + 1 nuevo):
- `src/app/globals.css` — agregar bloque .dark con variables oscuras estándar shadcn/ui
- `src/components/providers/proveedor-tema.tsx` — nuevo: wrapper cliente de ThemeProvider de next-themes
- `src/app/layout.tsx` — envolver con ProvedorTema; agregar suppressHydrationWarning al html
- `src/components/features/sidebar.tsx` — reemplazar clases gray por tokens semánticos; agregar botón toggle en el footer
- `src/app/(dashboard)/layout.tsx` — reemplazar bg-gray-50 por bg-background

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** `next-themes` instalado; bloque `.dark {}` con variables shadcn/ui estándar en `globals.css`; `ProvedorTema` wrapper cliente creado; `layout.tsx` envuelve con `ProvedorTema` y tiene `suppressHydrationWarning`; `sidebar.tsx` usa tokens semánticos (`bg-background`, `text-foreground`, `border-border`, `bg-accent`, `text-muted-foreground`) con botón Sol/Luna en el footer; `(dashboard)/layout.tsx` usa `bg-background`.
- **Español absoluto:** `ProvedorTema`, `alternarTema`, `proveedor-tema.tsx` — todos en español.
- **Seguridad:** sin secretos hardcodeados; sin `any`.
- **TSC:** cero errores.
- **Linter:** cero warnings.
- **Ajuste post-feedback:** toggle reubicado a `/settings` (sección Apariencia con select Claro/Oscuro/Sistema); sidebar sin botón de tema; `settings/page.tsx` migrado a tokens semánticos (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`); `formulario-apariencia.tsx` creado.
- **Nota UI:** archivos `.tsx` modificados bajo `src/components/features/` y `src/app/` — requiere validación visual en navegador.

## 2. Plan de Accion Detallado

### Bloque 1 - Infraestructura de tema

- [x] **Paso 1: instalar next-themes** Ejecutar `npm install next-themes` en el directorio del proyecto.

- [x] **Paso 2: `src/app/globals.css`** Agregar bloque `.dark {}` con las variables CSS oscuras estándar de shadcn/ui: --background: 222.2 84% 4.9%; --foreground: 210 40% 98%; --card: 222.2 84% 4.9%; --card-foreground: 210 40% 98%; --popover: 222.2 84% 4.9%; --popover-foreground: 210 40% 98%; --primary: 210 40% 98%; --primary-foreground: 222.2 47.4% 11.2%; --secondary: 217.2 32.6% 17.5%; --secondary-foreground: 210 40% 98%; --muted: 217.2 32.6% 17.5%; --muted-foreground: 215 20.2% 65.1%; --accent: 217.2 32.6% 17.5%; --accent-foreground: 210 40% 98%; --destructive: 0 62.8% 30.6%; --destructive-foreground: 210 40% 98%; --border: 217.2 32.6% 17.5%; --input: 217.2 32.6% 17.5%; --ring: 212.7 26.8% 83.9%.

- [x] **Paso 3: `src/components/providers/proveedor-tema.tsx`** Crear nuevo componente cliente con 'use client'. Importar ThemeProvider de 'next-themes'. Exportar componente `ProvedorTema({ children }: { children: React.ReactNode })` que retorna `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</ThemeProvider>`.

- [x] **Paso 4: `src/app/layout.tsx`** Importar ProvedorTema. Agregar `suppressHydrationWarning` al elemento `<html>`. Envolver `<body>` con `<ProvedorTema>`.

### Bloque 2 - Shell del dashboard

- [x] **Paso 5: `src/components/features/sidebar.tsx`** Reemplazar todas las clases gray hardcodeadas por tokens semánticos: `bg-white` → `bg-background`; `border-gray-100` → `border-border`; `text-gray-900` → `text-foreground`; `text-gray-600` → `text-muted-foreground`; `bg-gray-100` → `bg-accent`; `hover:bg-gray-50` → `hover:bg-accent/50`; `hover:text-gray-900` → `hover:text-foreground`; `text-gray-400` → `text-muted-foreground`; `text-gray-700` → `text-foreground`; `bg-gray-50` (en hover) → `hover:bg-accent/50`. Agregar importaciones de `Sun`, `Moon` y `useTheme` de 'next-themes'. En el footer, agregar botón de toggle al lado del engranaje: cuando tema es 'dark' mostrar icono Sun, sino Moon; onClick llama setTheme('dark'/'light').

- [x] **Paso 6: `src/app/(dashboard)/layout.tsx`** Reemplazar `bg-gray-50` por `bg-background` en el div raíz del layout.
