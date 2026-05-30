import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-cards/$id')({})

export const APIRoute = {
  path: '/api/credit-cards/$id',
  methods: {
    DELETE: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { deleteCreditCard } = await import('@/features/finance/api/credit-cards')
      try {
        await deleteCreditCard(session.user.id, params.id)
        return new Response(null, { status: 204 })
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err) {
          const prismaErr = err as { code: string }
          if (prismaErr.code === 'P2025') {
            return Response.json({ error: 'Cartão não encontrado' }, { status: 404 })
          }
          if (prismaErr.code === 'P2003') {
            return Response.json({ error: 'Cartão possui transações vinculadas' }, { status: 409 })
          }
        }
        return Response.json({ error: 'Erro ao excluir cartão' }, { status: 500 })
      }
    },
  },
}
