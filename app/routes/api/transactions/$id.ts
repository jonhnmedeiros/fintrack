import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/transactions/$id')({})

export const APIRoute = {
  path: '/api/transactions/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const body = await request.json()
      const { updateTransaction } = await import('@/features/finance/api/transactions')
      try {
        const transaction = await updateTransaction(session.user.id, params.id, body)
        return Response.json(transaction)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2025') {
            return Response.json({ error: 'Transação não encontrada' }, { status: 404 })
          }
        }
        return Response.json({ error: 'Erro ao atualizar transação' }, { status: 500 })
      }
    },
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteTransaction } = await import('@/features/finance/api/transactions')
      try {
        await deleteTransaction(session.user.id, params.id)
        return new Response(null, { status: 204 })
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2025') {
            return Response.json({ error: 'Transação não encontrada' }, { status: 404 })
          }
        }
        return Response.json({ error: 'Erro ao excluir transação' }, { status: 500 })
      }
    },
  },
}

