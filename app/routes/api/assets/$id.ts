import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/assets/$id')({})

export const APIRoute = {
  path: '/api/assets/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { updateAsset } = await import('@/features/investments/api/assets')
      try {
        const body = await request.json()
        const asset = await updateAsset(session.user.id, params.id, body)
        return Response.json(asset)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2025') {
            return Response.json({ error: 'Ativo não encontrado' }, { status: 404 })
          }
        }
        return Response.json({ error: 'Erro ao atualizar ativo' }, { status: 500 })
      }
    },
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteAsset } = await import('@/features/investments/api/assets')
      try {
        await deleteAsset(session.user.id, params.id)
        return new Response(null, { status: 204 })
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2025') {
            return Response.json({ error: 'Ativo não encontrado' }, { status: 404 })
          }
          if (prismaErr.code === 'P2003') {
            return Response.json({ error: 'Não é possível excluir ativo com transações vinculadas' }, { status: 409 })
          }
        }
        return Response.json({ error: 'Erro ao excluir ativo' }, { status: 500 })
      }
    },
  },
}

