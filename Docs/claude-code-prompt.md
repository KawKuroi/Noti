# Implementar el nuevo diseño de Noti

> **Para Claude Code:** Este prompt describe el nuevo sistema visual de Noti y las 11 pantallas a implementar. Aplica este diseño sin cambiar la lógica de negocio del repo (`github.com/KawKuroi/Noti`). Trabaja por fases, una pantalla a la vez, y muéstrame screenshots antes de continuar.

---

## 0. Reglas duras

- **No** toques rutas, endpoints, queries de Supabase, schema de DB, ni la lógica del Service Worker.
- **No** cambies copy en español que no esté explícitamente listado abajo.
- **No** introduzcas dependencias nuevas pesadas (Tailwind variants, Radix, shadcn pueden quedarse — sólo no añadas un design system completo nuevo).
- Si encuentras una decisión ambigua, **pregúntame** antes de inventar.
- Mantén la app funcional en cada commit. No dejes pantallas a medias.

---

## 1. Plan de trabajo

Sigue este orden, commit por fase:

1. **Tokens + tipografía global** (1 commit) — `globals.css`, layout root
2. **Sidebar + AppShell** (1 commit) — componente shared
3. **PageHeader + AIInput + ReminderRow + helpers** (1 commit) — primitives
4. **Dashboard (Inicio)** (1 commit)
5. **Lanzamientos** (1 commit)
6. **Calendario** (1 commit)
7. **Notas + Detalle cuaderno** (1 commit)
8. **Pendientes / Estudio / Cumpleaños / Eventos** (las categorías individuales, mismo layout) (1 commit)
9. **Configuración** (1 commit)
10. **Modal Búsqueda ⌘K** (1 commit)
11. **Side sheet Nuevo recordatorio** (1 commit)
12. **Login (auth screens)** (1 commit)
13. **Mobile / responsive** (1 commit)
14. **Dark mode** (1 commit)

---

## 2. Sistema de diseño

### 2.1 Tipografía

Carga **Geist + Geist Mono** desde Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
```

**Reglas críticas:**
- Sans default: `400`. Titulares y labels destacados: `500`. Avoid `600+` salvo logo y números muy pequeños.
- **Mono SIEMPRE en `font-weight: 500`** — a 400 se ve anémico en tamaños pequeños.
- `font-feature-settings: 'ss01','cv11'` en `body` para activar las stylistic sets de Geist.
- Letter-spacing negativo en titulares: `h1 { letter-spacing: -0.028em }`, `h2 { letter-spacing: -0.025em }`.
- Mono labels en uppercase usan `letter-spacing: 0.08-0.1em`.

```css
body {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  font-feature-settings: 'ss01','cv11';
  -webkit-font-smoothing: antialiased;
}
.mono {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-weight: 500;
  letter-spacing: 0.005em;
}
```

### 2.2 Color tokens

Pega esto en `app/globals.css` (o equivalente):

```css
:root {
  --bg: #ffffff;
  --bg-soft: #fafafa;
  --bg-elev: #ffffff;
  --ink: #0a0a0a;
  --ink-2: rgba(10,10,10,0.62);
  --ink-3: rgba(10,10,10,0.42);
  --ink-4: rgba(10,10,10,0.28);
  --line: rgba(10,10,10,0.08);
  --line-2: rgba(10,10,10,0.14);
  --accent: #0a0a0a;
  --accent-ink: #ffffff;

  /* Category accents — semantic, used ONLY for category indicators */
  --cat-peliculas: #dc2626;
  --cat-series: #7c3aed;
  --cat-juegos: #16a34a;
  --cat-musica: #ea580c;
  --cat-libros: #2563eb;
  --cat-notas: #d97706;
  --cat-estudio: #0ea5e9;
  --cat-cumple: #db2777;
  --cat-pendientes: #f59e0b;
  --cat-eventos: #14b8a6;
}

[data-theme="dark"] {
  --bg: #0a0a0a;
  --bg-soft: #0f0f0f;
  --bg-elev: #141414;
  --ink: #fafafa;
  --ink-2: rgba(250,250,250,0.66);
  --ink-3: rgba(250,250,250,0.42);
  --ink-4: rgba(250,250,250,0.28);
  --line: rgba(250,250,250,0.08);
  --line-2: rgba(250,250,250,0.16);
  --accent-ink: #0a0a0a;
}
```

**Regla de oro de color:** el color SÓLO se usa para indicar **categoría**. Todo lo demás es blanco/negro/grises. Si dudas si un elemento debería tener color, la respuesta es no.

Los acentos de categoría se usan así:
- Icono pequeño tintado: `background: color-mix(in oklab, var(--cat-X) 14%, transparent); color: var(--cat-X)`
- Pill badge: `background: color-mix(in oklab, var(--cat-X) 12%, transparent); color: var(--cat-X)`
- Dot inline: `background: var(--cat-X)`

Nunca uses una categoría como background completo, ni como borde grueso a la izquierda (ese patrón viejo se quita).

### 2.3 Spacing, radii, sombras

- **Radii:** card `14px`, input/button `10px`, icon-block `8-10px`, pill `999px`
- **Borders:** todo es `1px solid var(--line)` o `1px solid var(--line-2)` (más visible). No bordes de 2px.
- **Sombras:** prohibidas en cards. Permitidas SÓLO en modales/side-sheets focalizados: `box-shadow: 0 30px 80px -30px rgba(10,10,10,.18)`.
- **Padding section main:** `40px 44px` (desktop), `20px 22px` (mobile)
- **Gap entre tarjetas:** 8-10px en listas, 14-18px entre grupos

### 2.4 Animaciones

Mantén las animaciones discretas:
- Hover en cards: `border-color .15s ease` → ir a `var(--ink-4)`
- Hover en buttons primary: `transform: translateY(-1px)` + sombra suave
- Reveals on-scroll: `opacity 0→1` + `translateY(14px → 0)` con `cubic-bezier(.2,.7,.2,1)` y duración `.8s`. Stagger 60ms.
- Pulse dot (status indicator): `@keyframes pulse { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.6); opacity: .2 } }`

---

## 3. Componentes base

### 3.1 `<AppShell>` — Sidebar + main

- Layout `grid-template-columns: 230px 1fr`, fullscreen height.
- Sidebar tiene 4 zonas verticales:
  1. **Logo Noti** (cuadrado negro con "N" + dot verde de status)
  2. **Items top:** Inicio, Buscar (con hint `⌘K`)
  3. **Sección "Categorías"** (label mono uppercase + items con dot de color: Lanzamientos, Estudio, Cumpleaños, Pendientes, Eventos)
  4. **Sección "Herramientas"** (chev de colapsar): Calendario, Notas
  5. **Footer user**: avatar circular con letra + nombre + icono settings

**Active state de SideItem:** `background: var(--bg-soft); border: 1px solid var(--line); font-weight: 500`. NO uses fondo sólido negro como activo (eso es para botones).

### 3.2 `<PageHeader>`

```tsx
<PageHeader
  icon={<IconSparkle/>}           // opcional
  iconColor="var(--cat-series)"   // opcional
  title="Lanzamientos"
  subtitle="Películas, series, videojuegos, música y libros."
  action={<Button>+ Nuevo</Button>}
/>
```

- Si lleva icono, es un cuadrado de `46×46` con `border-radius: 12`, fondo tintado y color como arriba.
- Title: `font-size: 30px; font-weight: 500; letter-spacing: -0.025em`
- Subtitle: `font-size: 14.5px; color: var(--ink-2)`

### 3.3 `<AIInput>`

Pill grande con:
- Icono sparkle (24-26px square) tintado con `--cat-series` (morado)
- Placeholder: `¿Qué te recuerdo o agendo?`
- Hint a la derecha: kbd mono `Ctrl+I` con borde y `var(--bg-soft)`
- Border `1px solid var(--line-2)`, radius `12px`, padding `12px 14px`

### 3.4 `<ReminderRow>`

Grid `[checkbox] [icon-block 32px] [title + meta] [···]`:

- **Checkbox:** 20×20, radius 6, border 1.5px. Cuando `done`: fondo color de categoría + check blanco. Texto del título con `line-through` y opacity 0.55.
- **Icon block:** 32×32, radius 9, background color-mix 14% de categoría, icon en color de categoría.
- **Meta row:** mono date con icono de calendario chiquito + pill de categoría + opcional "Recurrente" con icono ↻.
- **No** uses border-left coloreado.

### 3.5 Botones

```css
/* Primary */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  background: var(--ink); color: var(--bg); border: 1px solid var(--ink);
  font-size: 13px; font-weight: 500;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -8px rgba(10,10,10,0.5);
}
/* Ghost */
.btn-ghost {
  background: var(--bg); color: var(--ink); border: 1px solid var(--line-2);
}
.btn-ghost:hover { background: var(--bg-soft); border-color: var(--ink-4); }
/* Pill (filter) */
.btn-pill { padding: 6-8px 12-14px; border-radius: 999px; font-size: 12.5px; }
```

### 3.6 Pills y badges

- **Category badge** (interior de ReminderRow): `padding: 3px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 500;` con tint 12% del color de categoría.
- **Count pill** (al lado de category filter): `padding: 2px 7px; border-radius: 999px; font-family: mono; font-size: 10.5px; background: var(--bg-soft); border: 1px solid var(--line);`
- **Kbd** (atajo de teclado): `padding: 2-3px 7-8px; border-radius: 5-6px; border: 1px solid var(--line-2); background: var(--bg-soft); font-family: mono; font-size: 10.5px;`

### 3.7 Inputs y selects

```css
.input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  border: 1px solid var(--line-2); background: var(--bg);
  font-size: 14px; font-family: inherit; color: var(--ink); outline: none;
}
.input:focus { border-color: var(--ink); }
```

Custom select: usa `appearance: none` y posiciona un `ChevronDown` absoluto a la derecha. El label encima del input es **mono uppercase** 11px color `var(--ink-3)`.

---

## 4. Pantallas

> Cada sección lista lo distintivo. Los patrones comunes (sidebar, header, etc.) ya están en §3.

### 4.1 Inicio (Dashboard)

Layout: `grid-template-columns: 1fr 340px`.

**Columna izquierda:**
- PageHeader: "Buenas noches, Axel" + sub "No tienes recordatorios para hoy." + action "+ Nuevo recordatorio"
- AIInput
- Sección "Próximos recordatorios" con counter mono a la derecha
- Grupos por fecha: `MAÑANA`, `ESTA SEMANA` (eyebrow mono uppercase + lista de ReminderRow)

**Columna derecha:**
- **MiniCalendar**: card 14px radius, 7-col grid. Día actual fondo negro (`var(--ink)`), texto blanco. Eventos como dots colorados (1-3 max) abajo de la fecha.
- **CategoryFilter**: card, lista de items `[dot] [label] [count pill]`. Active = fondo `var(--ink)` + texto blanco.

### 4.2 Lanzamientos

- PageHeader con icono `--cat-series`
- AIInput con placeholder distinto ("Pídele a la IA un estreno: «GTA 6 nov 19»")
- Eyebrow "MIS LANZAMIENTOS SEGUIDOS" + action "Agregar manualmente" a la derecha
- **Tabs** estilo segmented: pill container con `bg-soft + line`. Active tab: fondo `var(--bg)` + sombra 1px inferior sutil. Cada tab puede llevar un dot de color delante.
- Lista de ReminderRow

### 4.3 Calendario

- PageHeader título "Calendario" + sub. Action a la derecha: toggle pill **Mes/Semana** (Mes = active negro).
- Toolbar: `[< Mayo 2026 >]` + button "Hoy" + chips de filtro multi-select por categoría (cada chip lleva dot del color, active = negro)
- Grid 7 columnas × 5 filas. Cada celda:
  - Día (mono 12px). Si es hoy: círculo 22×22 negro con texto blanco.
  - Eventos como mini-rows: `[dot color] [título corto]` con `background: color-mix(in oklab, COLOR 8%, transparent); padding: 3px 6px; border-radius: 5px; font-size: 11px;`
  - Max 3 eventos por celda, después "+ N más"

### 4.4 Notas

- PageHeader icon `--cat-notas` + título "Notas" + sub "N cuadernos" + action "+ Nuevo cuaderno"
- Lista de cards de cuaderno, grid horizontal `[avatar 38px] [nombre + preview] [date mono]`
- Avatar es la primera letra del cuaderno, color de fondo tintado de una categoría, weight 600 mono
- Count pill al lado del nombre (cantidad de notas dentro)

### 4.5 Detalle de cuaderno

- Breadcrumb arriba: `[← back] Notas / Random`
- Header del cuaderno (avatar 44px + título + meta mono "N notas · editado hace X")
- Actions: "Buscar" (ghost) + "+ Nueva nota" (primary)
- Grid 3 columnas de cards. Cada card:
  - Dot de color arriba a la izquierda
  - Title 15px weight 500
  - Body con `white-space: pre-line`, max ~6 líneas con overflow hidden
  - Footer mono con fecha relativa, separado por border-top

### 4.6 Categoría individual (Pendientes/Estudio/Cumpleaños/Eventos)

Mismo layout que Lanzamientos pero:
- PageHeader con el color de la categoría
- **Filter pills** estado: Activos / Vencidos / Hoy / Completados (con counts)
- Grupos por fecha como en Dashboard (Vencido / Esta semana / Próximamente / Completados)

### 4.7 Configuración

- PageHeader simple
- Stack de `<ConfigCard>` con padding 22px 24px:
  - **Perfil:** input Nombre + Select Zona horaria + button "Guardar cambios"
  - **Apariencia:** ThemePicker (3 botones grandes con icono: Claro/Oscuro/Sistema). Active = borde negro + tint sutil.
  - **Notificaciones:** Select de anticipación
  - **Dispositivos registrados:** lista de DeviceRow con icono + nombre + sub mono + badge "ACTIVO" verde

### 4.8 Búsqueda ⌘K (modal)

- Backdrop: blur `6px` + `saturate(0.7)` del contenido detrás + overlay `rgba(10,10,10,0.32)`
- Modal centrado (top 16%, max-width 620px). Card con sombra fuerte.
- Header: icono lupa + input + kbd ESC
- Chips de filtro: Todo / Recordatorios / Notas / Lanzamientos
- Eyebrow "N resultados · X ms" mono
- Lista de resultados, item 0 con `var(--bg-soft)` (focus)
- Footer mono con hints de teclado: `↑↓ Navegar`, `↵ Abrir`, `Tab Filtrar`, `⌘K Cerrar`

### 4.9 Nuevo recordatorio (side sheet)

- Slide desde la derecha, width 520px, ocupa toda la altura
- Backdrop con `rgba(10,10,10,0.18)` sobre la pantalla actual
- Header: título "Nuevo recordatorio" + sub mono "o pídeselo a la IA con Ctrl+I" + ✕ close
- Body scroll: Título / Descripción / Fecha+Hora / Categoría (chips visuales con dot+nombre) / Notificar (select) / Toggle "Repetir cada año" (card con label + sub mono)
- Footer: hint `⌘↵ Guardar` + buttons Cancelar (ghost) + Crear (primary)

### 4.10 Login

Split 50/50:

**Izquierda (form):**
- Logo arriba
- H1 "Bienvenido de vuelta." + sub
- Button "Continuar con Google" (icon multicolor + texto, border ghost)
- Divider "O POR EMAIL" mono uppercase con líneas a los lados
- Field Email + Field Password
- Row: checkbox "Recordarme" + link "¿Olvidaste tu contraseña?" subrayado
- Button "Iniciar sesión" (primary, full width)
- Footer mono "¿Aún no tienes cuenta? Crear una"

**Derecha (visual):**
- Fondo negro (`var(--ink)`), texto blanco
- Dot-grid sutil con opacity 0.08
- Top: eyebrow mono "Push reales · Sin apps · Sin ruido"
- Middle: H1 grande "Recuerda lo que importa. Sin apps. Sin ruido." con segunda línea opacity 0.5
- Stack de 3 mini-notif (icono + título + tiempo) con `rgba(255,255,255,0.06)` background
- Bottom: footer mono URLs

### 4.11 Mobile (PWA en móvil)

Width 390, altura completa de viewport:

- Status bar fake (mono "9:41" + iconos)
- Header: logo + 2 botones icon-only (search, bell)
- Greeting compacto h1 26px
- AIInput
- Pills horizontal scroll (filtros: Todos, Hoy, Cumpleaños, Estudio, Pendientes)
- Lista de ReminderRowMobile (más compacto, sin las ··· y con padding reducido)
- **Bottom nav fijo** con 4 tabs + FAB centrado (Inicio, Calendario, [+], Notas, Perfil). FAB es 48×48 round negro con elevación.
- Home indicator iOS-style en el bottom

---

## 5. Dark mode

- Solo dos temas: `light` (default) y `dark`. El "Sistema" del ThemePicker usa `prefers-color-scheme`.
- En dark: el visual del login flippea (fondo cambia, pero la zona "marketing" derecha sigue siendo negra para mantener contraste).
- Verifica que los `color-mix` en oklab con tints de categoría se vean bien sobre `--bg` oscuro — algunos pueden necesitar subir a 20% tint para no perderse.
- Los toggles de tema se persisten en `localStorage` y se aplican antes del primer paint para evitar FOUC.

---

## 6. Mobile responsive (no sólo la pantalla 11)

Todas las pantallas deben adaptarse:
- `<768px`: el Sidebar se vuelve un drawer (hamburger en el header), el bottom nav aparece, el grid de Dashboard se vuelve 1 columna (mini-calendar y filter pasan abajo).
- `768-1024px`: sidebar permanece pero más estrecho (200px), 1 columna en dashboard.
- `>1024px`: layout completo.

---

## 7. Acceptance criteria

Antes de marcar una fase como hecha:

- [ ] Visual match ≥95% con las referencias (te paso screenshots si lo pides)
- [ ] Funciona en light + dark
- [ ] Funciona en desktop ≥1024px, tablet, mobile 390px
- [ ] Sin regresiones funcionales (todas las acciones de la app siguen funcionando)
- [ ] Lighthouse PWA score sigue >90
- [ ] No nuevas warnings de TypeScript
- [ ] No console errors en navegador

---

## 8. Cuando dudes

- ¿Color de fondo? → `var(--bg)`. ¿Sutil? → `var(--bg-soft)`.
- ¿Color de texto? → `var(--ink)`. ¿Secundario? → `var(--ink-2)`. ¿Sutil/placeholder? → `var(--ink-3)`.
- ¿Borde? → `1px solid var(--line)`. ¿Más visible? → `var(--line-2)`.
- ¿Border-radius? → 10 para botones/inputs, 14 para cards, 999 para pills.
- ¿Mono o sans? → Mono para todo lo que sea número/fecha/atajo/eyebrow. Sans para todo lo demás.
- ¿Weight? → 400 sans, 500 sans para énfasis/labels, **siempre 500 en mono**.
- ¿Usar emoji? → No. Usa icono SVG (Lucide).
- ¿Sombra? → No, salvo en modales focalizados.
- ¿Animación? → Subtle, máx 200-300ms, `cubic-bezier(.2,.7,.2,1)`.

---

## 9. Output esperado

Por cada fase del plan (§1), entrega:
1. Resumen de archivos creados/modificados
2. Screenshot del antes y el después
3. Diff de tokens si los tocaste
4. Cualquier decisión que tomaste y deberías validar

Empezamos por la **Fase 1: Tokens + tipografía global**. Confirma que entiendes el plan y procede.
