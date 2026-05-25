import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createFileRoute('/api/notifications/')({})

export const APIRoute = createAPIFileRoute('/api/notifications/')({
  GET: async () => {
    const { listNotifications } = await import('@/features/notifications/api/notifications')
    const notifications = await listNotifications()
    return Response.json(notifications)
  },
})

