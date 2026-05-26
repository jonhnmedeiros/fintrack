/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import appCss from '../globals.css?url'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FinTrack — Controle Financeiro' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: () => (
    <html lang="pt-BR" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <div id="root">
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <Layout>
                <Outlet />
              </Layout>
            </QueryClientProvider>
          </SessionProvider>
        </div>
        <Scripts />
      </body>
    </html>
  ),
})