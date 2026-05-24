import { createRootRoute, Outlet } from '@tanstack/start'
import { auth } from '@/lib/auth'
import { Layout } from '@/components/layout/Layout'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await auth()
    return { user: session?.user }
  },
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})
