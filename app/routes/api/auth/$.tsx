import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/auth/$')({})

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: async ({ request }) => {
    const { authHandlers } = await import('@/lib/auth')
    return authHandlers.GET(request as any)
  },
  POST: async ({ request }) => {
    const { authHandlers } = await import('@/lib/auth')
    return authHandlers.POST(request as any)
  },
})


