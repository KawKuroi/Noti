import coreWebVitals from 'eslint-config-next/core-web-vitals'

// Flat config (eslint 9+). `next lint` se retiro en Next 16: el script lint
// ahora invoca eslint directamente.
const config = [
  ...coreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    rules: {
      // Reglas nuevas de react-hooks v6 (llegaron con eslint-config-next 16,
      // diagnosticos del React Compiler). El codigo tiene ~20 usos
      // preexistentes (hidratacion desde sessionStorage, deteccion de
      // montaje, refs espejo para infinite scroll) que requieren refactor
      // dedicado. En warn para visibilidad sin bloquear el build.
      // Deuda registrada en Docs/CURRENT.md.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
]

export default config
