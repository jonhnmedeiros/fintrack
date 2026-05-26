import { hydrateRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './globals.css'

const router = createRouter({
  routeTree,
  defaultPendingMinMs: 0,
})

;(router as any).clientSsr = true

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Defer hydration to ensure router loads matches before React tries to hydrate
// the SSR HTML. Without this, React hydrates an empty tree, leaving SSR content
// without event handlers.
router.load().then(() => {
  hydrateRoot(document, <RouterProvider router={router} />)
})
