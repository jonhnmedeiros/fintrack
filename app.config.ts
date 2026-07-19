import { defineConfig } from '@tanstack/start/config'
import tsr from '@tanstack/router-plugin/vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    preset: process.env.VERCEL ? 'vercel' : 'node-server',
  },
  vite: {
    resolve: {
      alias: {
        '@': resolve('./app'),
      },
    },
    plugins: [
      tsr({
        routesDirectory: './app/routes',
        generatedRouteTree: './app/routeTree.gen.ts',
      }),
    ],
  },
  routers: {
    client: {
      vite: {
        build: {
          rollupOptions: {
            external: [
              '@prisma/client',
              /node_modules\/@prisma\//,
              /app\/generated\/prisma\//,
              /app\/lib\/(auth|db|tenant-db)/,
            ],
          },
        },
      },
    },
  },
})
