import { createRootRoute, Outlet, Scripts } from '@tanstack/react-router'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  beforeLoad: async () => {
    const { auth } = await import('@/lib/auth')
    const session = await auth()
    return { user: session?.user }
  },
  component: () => (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Outlet />
        </Layout>
        <Scripts />
      </QueryClientProvider>
    </SessionProvider>
  ),
})
