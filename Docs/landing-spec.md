# Noti — Landing Page · Spec de implementación

> Este documento describe **comportamiento, espacios, tamaños y animaciones**.
> El estilo gráfico (colores, tipografía, iconografía) ya está definido en `Noti.html`.

---

## 1. Estructura

Orden vertical de secciones, todas dentro de un contenedor `.wrap` (max-width **1180px**, padding lateral **28px** / **20px** en mobile):

1. `Nav` — fixed, top
2. `Hero` — con visual swappable
3. `Features` — grid de características
4. `Categories` — lista + sticky preview
5. `AIDemo` — chat interactivo
6. `AppPreview` — mocks con tabs
7. `FAQ` — acordeón
8. `FooterCTA` — bloque oscuro
9. `Footer` — minimal

---

## 2. Sistema de espaciado

| Token | Valor (regular) | Compact | Comfy |
|---|---|---|---|
| `--pad-section` (padding-top/bottom de cada sección) | **120px** | 80px | 160px |
| `--gap` (gap entre cards de grid) | **20px** | 14px | 28px |
| Padding lateral contenedor | 28px (desktop) / 20px (≤720px) | — | — |
| Hero — espacio simétrico alrededor del visual | **240px arriba y abajo** (margin-top visual = 240; hero `paddingBottom` = 120 + Features `paddingTop` = 120) | — | — |
| Margen entre eyebrow → h2 (Features, Categories, AIDemo, FAQ) | 14px | — | — |
| Margen heading → grid/lista | **48–64px** | — | — |
| Padding interno de card | **24px** (features) / 18–28px (mockups) | — | — |

**Regla:** los `padding-top` y `padding-bottom` de sección **siempre** usan `var(--pad-section)`. Nunca hardcodear.

---

## 3. Escala tipográfica

Todo en `clamp()` para escalar sin breakpoints:

| Elemento | Tamaño |
|---|---|
| Hero `h1` | `clamp(44px, 7vw, 88px)` · line-height **0.96** · weight 500 · tracking **-0.028em** |
| Section `h2` | `clamp(32px, 4.5vw, 56px)` · line-height **1.04** |
| Card `h3` | 19px · weight 500 |
| Body / `<p>` | `clamp(16px, 1.4vw, 19px)` · line-height **1.55** |
| Body card | 14px · line-height 1.55 |
| Eyebrow (mono uppercase) | 11px · letter-spacing **0.08em** |
| Meta mono | 10.5–11px · letter-spacing 0.04–0.08em |

Todos los headings llevan tracking negativo (-0.02 a -0.03em). Color secundario `var(--ink-3)` para “medias frases” dentro de un heading.

---

## 4. Componentes — medidas clave

### Nav (fixed)
- Altura: padding `14px 0` → ~58px
- Logo: cuadrado **28×28**, radius 8 (solo la "N", sin badge ni animaciones)
- Backdrop blur: `14px saturate(160%)`
- Border-bottom aparece SOLO con `scrollY > 12` (clase `.scrolled`)

### Botones (`.btn`)
- Padding **11px 16px** · radius **999px** · font-size 14px · weight 500
- Hover `btn-primary`: `translateY(-1px)` + shadow `0 8px 24px -8px <accent 50%>`
- Transition: `.2s ease` en transform, bg, color, border, shadow

### Cards (`.card`)
- Background `--bg-elev` · border `1px solid --line` · radius **14px** (`--radius`)
- Cards principales de mockup: radius **18px**
- Shadow estándar: `0 30px 80px -30px rgba(10,10,10,.18)`
- Shadow “floating” (mockups grandes): `0 50px 100px -40px rgba(10,10,10,.22), 0 12px 30px -15px rgba(10,10,10,.10)`

### Iconos
- En badges de categoría: contenedor **20–40px**, radius 6–10, bg `color-mix(in oklab, <color> 14–16%, transparent)`, icono color sólido
- SVG stroke-width **1.8**, line-cap round

### Hit targets mínimos
- Botones: 32px de alto mínimo (con padding cumple)
- Toggles del FAQ: contenedor de **28×28** para el `+`

---

## 5. Animaciones — catálogo

### 5.1 Scroll-reveal (toda la página)
Las clases `.reveal` empiezan en:
```
opacity: 0; transform: translateY(14px);
transition: opacity .8s cubic-bezier(.2,.7,.2,1),
            transform .8s cubic-bezier(.2,.7,.2,1);
```
Un `IntersectionObserver` (threshold **0.12**, rootMargin `0px 0px -8% 0px`) añade `.in` cuando entran. El delay se controla con `data-d="1..5"` → 60/120/180/240/300ms.

**Regla:** todo elemento de contenido nuevo lleva `.reveal`. Headings → `data-d="1"`, párrafo → `"2"`, CTAs → `"3"`, visual → `"5"`.

### 5.2 Keyframes globales

| Nombre | Uso | Duración / curva |
|---|---|---|
| `float-in` | Aparición suave de cards y items al cargar/cambiar | `.4–.8s` ease-out, `translateY(8px)` → 0 |
| `marquee` | Reservado para carruseles infinitos | `translateX(0 → -50%)` lineal |
| `blink` | Cursor del typewriter | `1s steps(2)` infinite |
| `pulse` | Dots de status (chat thinking, "consultando…", hint device) | `2–2.4s ease-in-out` infinite, scale 1→1.6, opacity .9→.2 |
| `notif-stack-rise` | Toast del Hero + stack de notifs | `5–6s ease-in-out` infinite, fade+slide |

### 5.3 Hero — variantes
- **Mockup**: card aparece con `float-in .8s`. Cada fila stagger **70ms** (`float-in .6s ${i*70 + 200}ms both`). Toast flotante en loop con `notif-stack-rise 5s infinite`.
- **Notifs stack**: cada notif loopea `notif-stack-rise 6s ${i*0.9}s infinite`. Shadow crece con `i` (`0 ${20+i*6}px ${30+i*6}px ...`).
- **Chat IA**: ciclo de 4 ejemplos. Fases por mensaje:
  - `typing`: 42ms/char (typewriter) + cursor blink
  - `thinking`: 700ms, 3 dots con `pulse` desfasada 150ms
  - `reply`: aparece con `float-in .35s`, se queda 2800ms
  - Loop a siguiente ejemplo
- **Typo flotante**: heading + 6 chips con `float-in .7s` y delay `300 + i*80ms`. Cada chip tiene rotación fija entre **-8° y 8°**.
- **Calendar**: dots de eventos aparecen con `float-in .5s` stagger `i*25 + j*80ms`. Chips inferiores con delay 600ms.

### 5.4 Categories
- Hover en una fila → `paddingLeft: 4 → 12px` (`transition .2s ease`)
- Color/badge transitions `.25s ease`
- La preview de la derecha re-monta con `key={active.name}` → re-dispara `float-in .4s`
- Sticky a `top: 110px`

### 5.5 AI Demo
- Auto-run al montar tras **800ms**
- Mismas fases que el Hero-Chat, pero con duración fija entre ejemplos: 4200ms tras `done`
- Click en cualquier prompt → `reset()` + `run(idx)` inmediato

### 5.6 App Preview tabs
- Tab activo: bg `--ink`, transition `.2s ease`
- Cambiar de tab: el mock se re-monta → `float-in .5s`

### 5.7 FAQ
- `max-height` animado de `0 → 200px` con `.35s cubic-bezier(.2,.7,.2,1)`
- Opacidad `.25s ease`
- Icono `+` rota **45°** al abrir + cambio de fondo a `--ink`

### 5.8 Reduced motion
Idealmente añadir:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
  .reveal { opacity: 1; transform: none; }
}
```

---

## 6. Responsive

| Breakpoint | Cambio |
|---|---|
| `≤ 840px` | `Categories` pasa a 1 columna · preview pierde `position: sticky` |
| `≤ 760px` | Links del Nav se ocultan (queda logo + tema + GitHub + CTA) |
| `≤ 720px` | Padding lateral baja a 20px |

Hero `h1` y `h2` ya escalan con `clamp()` — no necesitan breakpoints.

---

## 7. Interacciones / estado

- **Scroll listener** del Nav: `{ passive: true }`, dispara con `scrollY > 12`
- **IntersectionObserver** del reveal: se desconecta al observar y `unobserve` por elemento (one-shot)
- **Focus ring** global: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`
- **Selection**: invertida (`background: var(--ink); color: var(--bg)`)

---

## 8. Performance notes

- Animaciones SOLO sobre `transform` y `opacity` (nunca `top`, `left`, `width`)
- `overflow-x: hidden` en `body` por los elementos flotantes del Hero
- Fuentes con `display=swap`, preconnect a `fonts.googleapis.com` + `fontshare`
- `will-change` no se usa: las animaciones son cortas y compositadas naturalmente

---

## 9. Checklist al construir una sección nueva

- [ ] Wrapper `<section>` con `paddingTop/Bottom: var(--pad-section)`
- [ ] `.wrap` dentro
- [ ] Heading bloque con eyebrow + h2 (margin-bottom 48–64px)
- [ ] Cada elemento de contenido con `.reveal` + `data-d` escalonado
- [ ] Cards con `.card` y radius 14–18
- [ ] Hovers transition `.2–.25s ease`
- [ ] Probar con `data-density="compact"` y `"comfy"` que el ritmo aguanta
- [ ] Probar con `data-dark="true"` que los `color-mix` siguen legibles
