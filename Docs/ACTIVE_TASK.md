### 1. Contexto y Archivos Afectados

**Tarea:** Sprint final de Fase 23 — Tests E2E con Playwright, PWA Widget API para Windows 11, e i18n con next-intl (español + inglés, sin cambio de URL).

| Archivo | Feature | Rol |
|---|---|---|
| `playwright.config.ts` | E2E | Configuracion del runner (webServer, baseURL, chromium) |
| `tests/e2e/flujo-recordatorio.spec.ts` | E2E | Tests: landing, login, redireccion de ruta protegida, creacion de recordatorio |
| `package.json` | E2E + i18n | devDependency @playwright/test, next-intl, script test:e2e |
| `public/manifest.json` | Widget | Agregar propiedad widgets[] con definicion de widget de proximos recordatorios |
| `public/widget-template.json` | Widget | Plantilla Adaptive Cards para Windows 11 |
| `public/sw.js` | Widget | Handlers widgetinstall, widgetuninstall, widgetresume |
| `src/app/api/widget/route.ts` | Widget | GET autenticado: devuelve los proximos 5 recordatorios como JSON |
| `src/i18n/request.ts` | i18n | getRequestConfig leyendo cookie NEXT_LOCALE, default 'es' |
| `next.config.ts` | i18n | Envolver con createNextIntlPlugin |
| `messages/es.json` | i18n | Mensajes en espanol: Sidebar, Comun, Settings |
| `messages/en.json` | i18n | Mensajes en ingles equivalentes |
| `src/app/layout.tsx` | i18n | Convertir a async, agregar NextIntlClientProvider |
| `src/components/features/sidebar.tsx` | i18n | Aplicar useTranslations para etiquetas de navegacion |
| `src/components/features/settings/formulario-idioma.tsx` | i18n | Selector ES/EN que escribe cookie NEXT_LOCALE y llama router.refresh() |
| `src/app/(dashboard)/settings/page.tsx` | i18n | Agregar seccion "Idioma" con FormularioIdioma y getLocale() |

**Justificacion de exceso (15 archivos):** usuario solicito explicitamente completar los 3 items restantes del roadmap en un solo ciclo. Cada feature es independiente y toca archivos distintos.

### 3. Reporte de Pruebas

**Estado:** [APROBADO]

- Cumplimiento funcional: Playwright setup + tests sin auth + test salteable con credenciales; Widget API en manifest + sw.js + template + endpoint /api/widget; i18n con next-intl cookie-based, sidebar traducido, toggle en settings.
- Espanol absoluto: todos los identificadores nuevos en espanol. Verificado.
- Seguridad: sin secretos hardcodeados. RLS respetado en /api/widget (requiere sesion activa). Verificado.
- `npx tsc --noEmit`: sin errores.
- `npx next lint`: sin warnings ni errores.

### 2. Plan de Accion Detallado

#### Bloque 1 — Tests E2E (Playwright)

- [x] **Paso 1: [package.json]** Instalar `@playwright/test` como devDependency via npm y agregar script `"test:e2e": "playwright test"`.

- [x] **Paso 2: [playwright.config.ts]** Crear con: `testDir: './tests/e2e'`, `baseURL: 'http://localhost:3000'`, `use: { browserName: 'chromium', headless: true }`, `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true }`.

- [x] **Paso 3: [tests/e2e/flujo-recordatorio.spec.ts]** Crear tres tests sin auth: (1) la landing page (`/`) muestra un `h1` visible; (2) `/login` muestra un `form`; (3) navegar a `/inicio` sin sesion redirige a `/login`. Agregar un cuarto test salteable (`test.skip`) que requiere `E2E_EMAIL` y `E2E_PASSWORD` en entorno para probar el flujo completo de creacion de recordatorio.

#### Bloque 2 — PWA Widget API

- [x] **Paso 4: [public/manifest.json]** Agregar propiedad `"widgets"` como array con un objeto: `name: "Proximos recordatorios"`, `description: "Los recordatorios mas cercanos del dia"`, `tag: "noti-proximos"`, `ms_ac_template: "/widget-template.json"`, `data: "/api/widget"`, `update: 3600`, `icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }]`.

- [x] **Paso 5: [public/widget-template.json]** Crear plantilla Adaptive Cards v1.5 con: `type: "AdaptiveCard"`, `body` con un `TextBlock` titulo "Proximos recordatorios" bold y un `Container` con texto dinamico `${proximosTexto}`, `actions` con un `Action.OpenUrl` apuntando a `/inicio`.

- [x] **Paso 6: [public/sw.js]** Agregar al final del archivo tres handlers protegidos por `if (self.widgets)`: `widgetinstall` que llama `self.widgets.updateByTag('noti-proximos', payload)` con datos de carga inicial; `widgetuninstall` que limpia el tag; `widgetresume` que re-envia los datos actuales. El payload tiene `template: 'noti-proximos'` y `data: JSON.stringify({ proximosTexto: 'Cargando...' })`.

- [x] **Paso 7: [src/app/api/widget/route.ts]** Crear GET handler que: llama `requerirUsuario()`, llama `getRecordatoriosProximos(usuarioId, 5)`, formatea los resultados como texto (`titulo — fecha`) y devuelve JSON `{ proximosTexto: string }`. Sin autenticacion devuelve 401.

#### Bloque 3 — i18n con next-intl (sin cambio de URL)

- [x] **Paso 8: [npm install]** Ejecutar `npm install next-intl`.

- [x] **Paso 9: [src/i18n/request.ts]** Crear con `getRequestConfig` que lee `(await cookies()).get('NEXT_LOCALE')?.value ?? 'es'` e importa dinamicamente `../../messages/${locale}.json`. Locale valido: solo `'es'` o `'en'`; cualquier otro valor cae a `'es'`.

- [x] **Paso 10: [next.config.ts]** Importar `createNextIntlPlugin` desde `'next-intl/plugin'`, llamar `const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')` y envolver el export: `export default withNextIntl(config)`.

- [x] **Paso 11: [messages/es.json]** Crear con namespace `Sidebar` (Inicio, Lanzamientos, Calendario, Buscar, Configuracion, Herramientas, Cerrar herramientas), namespace `Comun` (Guardar, Cancelar, Crear, Editar, Eliminar, Buscar, Cargando) y namespace `Settings` (titulo, subtitulo, idioma, idiomaDescripcion, espanol, ingles).

- [x] **Paso 12: [messages/en.json]** Crear con las mismas claves traducidas al inglés.

- [x] **Paso 13: [src/app/layout.tsx]** Convertir `LayoutRaiz` a async. Importar `{ NextIntlClientProvider }` de `'next-intl'` e `{ getLocale, getMessages }` de `'next-intl/server'`. Llamar `const locale = await getLocale()` y `const messages = await getMessages()`. Envolver el interior del `<body>` con `<NextIntlClientProvider locale={locale} messages={messages}>`. Cambiar `lang="es"` a `lang={locale}`.

- [x] **Paso 14: [src/components/features/sidebar.tsx]** Agregar `import { useTranslations } from 'next-intl'` al inicio. Dentro de `Sidebar` agregar `const t = useTranslations('Sidebar')`. Reemplazar las etiquetas de texto hardcodeadas en los items de navegacion ("Inicio", "Lanzamientos", "Calendario", "Herramientas") con llamadas a `t('inicio')`, `t('lanzamientos')`, etc.

- [x] **Paso 15: [src/components/features/settings/formulario-idioma.tsx]** Crear componente cliente que recibe `localeActual: string`. Renderiza dos botones ES/EN. Al hacer clic: `document.cookie = 'NEXT_LOCALE=' + locale + '; path=/; max-age=31536000'` y `router.refresh()`.

- [x] **Paso 16: [src/app/(dashboard)/settings/page.tsx]** Importar `getLocale` de `'next-intl/server'` y `FormularioIdioma`. Agregar `const localeActual = await getLocale()` junto a las otras queries. Agregar nueva `<section>` con titulo "Idioma", descripcion y `<FormularioIdioma localeActual={localeActual} />` antes de la seccion "Cuenta".
