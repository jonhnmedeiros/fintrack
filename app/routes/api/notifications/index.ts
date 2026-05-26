import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/notifications/')({})

export const APIRoute = {
  path: '/api/notifications/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { listNotifications } = await import('@/features/notifications/api/notifications')
      const notifications = await listNotifications(session.user.id)
      return Response.json(notifications)
    },
  },
}

