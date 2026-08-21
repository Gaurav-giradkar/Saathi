import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createAiMiddleware } from './server/aiServerMiddleware.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Inject loaded env into process.env for the server
  Object.assign(process.env, env)

  const aiPlugin = {
    name: 'saathi-ai-server-middleware',
    configureServer(server) {
      server.middlewares.use(createAiMiddleware(process.env))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createAiMiddleware(process.env))
    },
  }

  return {
    plugins: [react(), aiPlugin],
    server: {
      port: 5173,
    },
  }
})
