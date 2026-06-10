import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Config de Vitest para los unit tests (tests/unit/). Los E2E viven en
// tests/e2e/ y los corre Playwright (npm run test:e2e), por eso se excluyen.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
