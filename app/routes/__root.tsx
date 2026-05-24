import { createRootRoute, Outlet } from '@tanstack/start'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <Outlet />
    </div>
  ),
})
