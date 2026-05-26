import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/alerts/')({})

export const APIRoute = {
  path: '/api/alerts/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { listAlerts } = await import('@/features/investments/api/alerts')
      const alerts = await listAlerts(session.user.id)
      return Response.json(alerts)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const body = await request.json()
      const { createAlert } = await import('@/features/investments/api/alerts')
      const alert = await createAlert(session.user.id, body)
      return Response.json(alert)
    },
  },
}

