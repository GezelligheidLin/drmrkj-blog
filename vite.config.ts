import { fileURLToPath, URL } from 'node:url'

import type { UserConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'

import createVitePlugins from './vite/plugins/index.js'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  // const { VITE_APP_ENV, VITE_API_BASE_URL } = env
  const base = '/'
  return {
    base,
    plugins: createVitePlugins({
      env,
      mode,
      base,
      isBuild: command === 'build',
    }),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 8008,
    },
  }
}) as UserConfig
