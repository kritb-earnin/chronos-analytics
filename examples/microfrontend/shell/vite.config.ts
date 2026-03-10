import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'chronos_mf_shell',
      remotes: {
        chronos_mf_remote: 'http://localhost:5176/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'chronos-analytics': { singleton: true, requiredVersion: '^0.1.0' },
      },
    }),
  ],
  server: {
    port: 5175,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
