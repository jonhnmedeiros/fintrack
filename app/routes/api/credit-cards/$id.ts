import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/credit-cards/$id')({})

export const APIRoute = {
  path: '/api/credit-cards/$id',
  methods: {
    PUT: async ({ request, params }) => {
      const { auth } = await import('@/lib/auth')
      const session = await auth(request)
      if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
      if (session.user.role === 'VISUALIZADOR') {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
      }
      const { updateCreditCard } = await import('@/features/finance/api/credit-cards')
      try {
        const body = await request.json()
        const card = await updateCreditCard(session.user.id, params.id, body)
        return Response.json(card)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
          return Response.json({ error: 'Dados inválidos' }, { status: 400 })
        }
        if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2025') {
          return Response.json({ error: 'Cartão não encontrado' }, { status: 404 })
        }
        return Response.json({ error: 'Erro ao atualizar cartão' }, { status: 500 })
      }
    },
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
