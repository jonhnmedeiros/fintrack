import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/notifications/')({})

export const APIRoute = {
  path: '/api/notifications/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listNotifications } = await import('@/features/notifications/api/notifications')
      const notifications = await listNotifications(effectiveUserId)
      return Response.json(notifications)
    },
  },
}

