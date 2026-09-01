import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: 'tests/vitest-setup.ts',
    // Vitest 4 only excludes `node_modules` and `.git` by default, so scope the
    // scan to `tests/` to keep `dist/` and the bundler output fixtures out of it.
    dir: 'tests',
    coverage: {
      enabled: true,
      // Vitest 4 dropped `coverage.all`; untested files are only reported when
      // they are matched by an explicit `include` pattern.
      include: ['src/**'],
      reporter: ['text', 'lcov', 'cobertura']
    }
  }
});
