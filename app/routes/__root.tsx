import { createRootRoute, Outlet } from '@tanstack/start'
import { auth } from '@/lib/auth'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await auth()
    return { user: session?.user }
  },
  component: () => (
    <div className="min-h-screen">
      <Outlet />
    </div>
  ),
})
