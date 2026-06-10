import { defineConfig } from 'vitest/config'

// Config de Vitest para los unit tests (tests/unit/). Los E2E viven en
// tests/e2e/ y los corre Playwright (npm run test:e2e), por eso se excluyen.
// resolve.tsconfigPaths reutiliza el alias @/* del tsconfig (soporte nativo de Vite).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
