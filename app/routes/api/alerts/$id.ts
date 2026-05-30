import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/alerts/$id')({})

export const APIRoute = {
  path: '/api/alerts/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteAlert } = await import('@/features/investments/api/alerts')
      try {
        await deleteAlert(session.user.id, params.id)
        return new Response(null, { status: 204 })
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2025') {
            return Response.json({ error: 'Alerta não encontrado' }, { status: 404 })
          }
        }
        return Response.json({ error: 'Erro ao excluir alerta' }, { status: 500 })
      }
    },
  },
}

