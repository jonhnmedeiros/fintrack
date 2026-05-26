import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/notifications/$id')({})

export const APIRoute = {
  path: '/api/notifications/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      if (body.read) {
        const { markAsRead } = await import('@/features/notifications/api/notifications')
        await markAsRead(session.user.id, params.id)
      }
      return new Response(null, { status: 204 })
    },
  },
}

