# Efecto Scroll-Sticky en Categorías de la Landing

Este documento detalla la implementación técnica del efecto de desplazamiento interactivo (scroll-sticky y scroll-driven highlighting) en la sección de categorías de la página de inicio (Landing Page).

## Descripción del Comportamiento

La sección de categorías consta de dos partes principales en resoluciones de escritorio:
1. Una lista vertical de filas de categorías (`.cat-row`).
2. Una vista previa (`.cat-preview`) en el lado derecho que muestra información detallada de la categoría activa.

### 1. Posicionamiento Sticky (`position: sticky`)
Para mantener la vista previa visible mientras el usuario se desplaza por la lista de categorías, se utiliza la propiedad CSS `position: sticky`.
- **Selector:** `.cat-preview`
- **Offset superior (`top`):** `110px` (para alinearse con el diseño general y evitar superposiciones con la barra de navegación superior).

### 2. Resaltado Dinámico basado en Scroll (`IntersectionObserver`)
Anteriormente, el cambio de categoría activa se basaba exclusivamente en eventos de mouse (`onMouseEnter`). Para mejorar la experiencia de usuario móvil y de desplazamiento continuo, se implementó detección automática por scroll usando `IntersectionObserver`.

#### Configuración del Observer:
- **Umbral (`threshold`):** `0.5` (la fila debe estar al menos al 50% de visibilidad dentro de la zona de interacción).
- **Margen de la raíz (`rootMargin`):** `'-25% 0px -40% 0px'` (define una "franja activa" en la parte central-superior de la pantalla donde se gatilla la detección).

#### Flujo de Ejecución:
1. Al montar el componente, se crea el `IntersectionObserver`.
2. Se observan todas las filas con la clase `.cat-row`.
3. Cuando una fila entra en la franja activa, se lee su atributo `data-index` y se actualiza el estado `hover` del componente para cambiar la categoría visualizada.
4. Al desmontar el componente, se llama a `observer.disconnect()` para evitar fugas de memoria.

---

## Archivos Involucrados

- [src/components/landing/categories.tsx](file:///d:/Programacion/Proyectos/Noti/src/components/landing/categories.tsx): Implementación de la lógica de React y los estilos en línea.
