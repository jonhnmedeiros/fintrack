import { defineConfig } from '@tanstack/start/config'
import tsr from '@tanstack/router-plugin/vite'

export default defineConfig({
  vite: {
    plugins: [
      tsr({
        routesDirectory: './app/routes',
        generatedRouteTree: './app/routeTree.gen.ts',
      }),
    ],
  },
})
