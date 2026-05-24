import { StartClient } from '@tanstack/start'
import { createRouter } from '@tanstack/start'
import { createRoot } from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import './globals.css'

const router = createRouter({ routeTree })

declare module '@tanstack/start' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(<StartClient router={router} />)
