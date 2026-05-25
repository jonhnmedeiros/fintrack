import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/notifications/$id')({})

export const APIRoute = createAPIFileRoute('/api/notifications/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json()
    if (body.read) {
      const { markAsRead } = await import('@/features/notifications/api/notifications')
      await markAsRead(params.id)
    }
    return new Response(null, { status: 204 })
  },
})

