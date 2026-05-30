import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/assets/')({})

export const APIRoute = {
  path: '/api/assets/',
  methods: {
    GET: async ({ request }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      const { getEffectiveUserId } = await import('@/lib/tenant-db')
      const effectiveUserId = getEffectiveUserId(session.user)
      const { listAssets } = await import('@/features/investments/api/assets')
      const assets = await listAssets(effectiveUserId)
      return Response.json(assets)
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
        const { createAsset } = await import('@/features/investments/api/assets')
        const asset = await createAsset(session.user.id, body)
        return Response.json(asset)
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2002') {
            return Response.json({ error: 'Já existe um ativo com este ticker' }, { status: 409 })
          }
        }
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        return Response.json({ error: 'Erro ao criar ativo' }, { status: 500 })
      }
    },
  },
}

