import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/alerts/')({})

export const APIRoute = {
  path: '/api/alerts/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listAlerts } = await import('@/features/investments/api/alerts')
      const alerts = await listAlerts(effectiveUserId)
      return Response.json(alerts)
    },
    POST: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      try {
        const body = await request.json()
        const { createAlert } = await import('@/features/investments/api/alerts')
        const alert = await createAlert(session.user.id, body)
        return Response.json(alert)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar alerta' }, { status: 500 })
      }
    },
  },
}

