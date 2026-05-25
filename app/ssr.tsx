import { createStartHandler, defaultStreamHandler } from '@tanstack/start/server'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { getRouterManifest } from '@tanstack/react-start-router-manifest'
import { routeTree } from './routeTree.gen'

function createRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
  })
}

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
