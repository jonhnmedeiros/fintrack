import { createStartHandler, defaultStreamHandler } from '@tanstack/start'
import { createRouter } from '@tanstack/start'
import { getRouterManifest } from '@tanstack/start/server'
import { routeTree } from './routeTree.gen'

const handler = createStartHandler({
  createRouter,
  getRouterManifest,
  routeTree,
})

export default defaultStreamHandler(handler)
