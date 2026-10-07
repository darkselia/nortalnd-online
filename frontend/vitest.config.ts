import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.spec.ts'],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          hookTimeout: 30_000,
          include: ['tests/nuxt/**/*.spec.ts'],
          setupFiles: ['./tests/setup.ts'],
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
              overrides: {
                ui: { fonts: false },
              },
            },
          },
        },
      }),
    ],
  },
});
