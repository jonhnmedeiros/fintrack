import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/investment-transactions/$id')({})

export const APIRoute = {
  path: '/api/investment-transactions/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteInvestmentTransaction } = await import('@/features/investments/api/investment-transactions')
      try {
        await deleteInvestmentTransaction(session.user.id, params.id)
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
