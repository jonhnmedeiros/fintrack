import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/settings/preferences')({})

export const APIRoute = {
  path: '/api/settings/preferences',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { getInvestPreferences } = await import('@/features/settings/api/preferences')
      const prefs = await getInvestPreferences(effectiveUserId)
      return Response.json(prefs)
    },
    PUT: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { updateInvestPreferences } = await import('@/features/settings/api/preferences')
      try {
        const body = await request.json()
        const prefs = await updateInvestPreferences(session.user.id, body)
        return Response.json(prefs)
      } catch (err: unknown) {
        return Response.json(
          { error: err instanceof Error ? err.message : 'Erro ao salvar preferências' },
          { status: 400 }
        )
      }
    },
  },
}
