import { createAPIFileRoute } from '@tanstack/start'
import * as notificationsApi from '@/features/notifications/api/notifications'

export const APIRoute = createAPIFileRoute('/api/notifications/')({
  GET: async () => {
    const notifications = await notificationsApi.listNotifications()
    return Response.json(notifications)
  },
})
