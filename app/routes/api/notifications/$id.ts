import { createAPIFileRoute } from '@tanstack/start'
import * as notificationsApi from '@/features/notifications/api/notifications'

export const APIRoute = createAPIFileRoute('/api/notifications/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json()
    if (body.read) {
      await notificationsApi.markAsRead(params.id)
    }
    return new Response(null, { status: 204 })
  },
})
