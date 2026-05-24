import { createFileRoute } from '@tanstack/react-router'
import { authHandlers } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return authHandlers.GET(request as any)
      },
      POST: async ({ request }) => {
        return authHandlers.POST(request as any)
      },
    },
  },
})
