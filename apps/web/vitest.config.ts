import { defineConfig } from 'vitest/config';

// Unit tests live under src/. Playwright e2e specs (e2e/**) run via
// `pnpm test:e2e`, not vitest — exclude them so `pnpm test` only runs units.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
  },
});
