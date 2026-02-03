// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt', // O pulo do gato: Simula o ambiente Nuxt
    // Você pode querer ignorar a pasta de testes e2e se tiver
    // exclude: ['**/node_modules/**', '**/e2e/**'],
  }
})